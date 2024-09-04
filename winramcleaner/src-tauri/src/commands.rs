use std::collections::HashMap;
use std::fs::{File, create_dir_all};
use std::io::Write;
use std::path::Path;
use std::process::Command;
use reqwest::get;
use zip::ZipArchive;
use chrono::Utc;

const RAMMAP_URL: &str = "https://download.sysinternals.com/files/RAMMap.zip";

fn get_rammap_path() -> String {
    let rammap_dir = "resources/RamMap";
    if cfg!(target_arch = "x86_64") {
        format!("{}/RamMap64.exe", rammap_dir)
    } else if cfg!(target_arch = "x86") {
        format!("{}/RamMap.exe", rammap_dir)
    } else {
        format!("{}/RamMap64a.exe", rammap_dir)
    }
}

fn log_with_timestamp(message: &str) -> String {
    let timestamp = Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    format!("[{}] {}", timestamp, message)
}

#[tauri::command]
pub async fn ensure_rammap() -> Result<String, String> {
    let rammap_dir = "resources/RamMap";

    if !Path::new(rammap_dir).exists() {
        create_dir_all(rammap_dir).map_err(|e| log_with_timestamp(&e.to_string()))?;
    }

    let rammap_path = get_rammap_path();

    if !Path::new(&rammap_path).exists() {
        let zip_path = download_rammap().await.map_err(|e| log_with_timestamp(&e.to_string()))?;

        let file = File::open(zip_path).map_err(|e| log_with_timestamp(&e.to_string()))?;
        let mut archive = ZipArchive::new(file).map_err(|e| log_with_timestamp(&e.to_string()))?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| log_with_timestamp(&e.to_string()))?;
            let outpath = Path::new(rammap_dir).join(file.name());
            if file.name().ends_with('/') {
                create_dir_all(&outpath).map_err(|e| log_with_timestamp(&e.to_string()))?;
            } else {
                let mut out_file = File::create(outpath).map_err(|e| log_with_timestamp(&e.to_string()))?;
                std::io::copy(&mut file, &mut out_file).map_err(|e| log_with_timestamp(&e.to_string()))?;
            }
        }

        Ok(log_with_timestamp("RamMap downloaded and extracted."))
    } else {
        Ok(log_with_timestamp("RamMap already exists."))
    }
}

async fn download_rammap() -> Result<String, Box<dyn std::error::Error>> {
    let response = get(RAMMAP_URL).await?;
    let bytes = response.bytes().await?;

    let path = Path::new("resources/RamMap.zip");
    let mut file = File::create(&path)?;
    file.write_all(&bytes)?;

    Ok(path.to_str().unwrap().to_string())
}

#[tauri::command]
pub async fn execute_rammap_commands() -> Result<String, String> {
    let rammap_path = get_rammap_path();
    if !Path::new(&rammap_path).exists() {
        return Err(log_with_timestamp("RamMap executable not found. Please ensure it's downloaded."));
    }

    let mut commands = HashMap::new();
    commands.insert(vec!["-accepteula", "-Ew"], "Empty Working Sets");
    commands.insert(vec!["-accepteula", "-Es"], "Empty System Working Sets");
    commands.insert(vec!["-accepteula", "-Em"], "Empty File Cache");
    commands.insert(vec!["-accepteula", "-Et"], "Empty Modified Page List");
    commands.insert(vec!["-accepteula", "-E0"], "Empty Standby List");

    let mut output_string = String::new();

    for (args, description) in commands.iter() {
        let output = Command::new(&rammap_path)
            .args(args)
            .output()
            .map_err(|e| log_with_timestamp(&e.to_string()))?;

        let log_entry = format!(
            "[{}] Executed command {:?} ({}): {}\n",
            Utc::now().format("%Y-%m-%d %H:%M:%S"),
            args,
            description,
            String::from_utf8_lossy(&output.stdout)
        );
        output_string.push_str(&log_entry);
    }

    output_string.push_str(&"=".repeat(36));
    Ok(output_string)
}