use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::process::Command;
use reqwest::get;
use tauri::command;

const RAMMAP_URL: &str = "https://download.sysinternals.com/files/RAMMap.zip"; // 다운로드할 URL

async fn download_rammap() -> Result<String, Box<dyn std::error::Error>> {
    let response = get(RAMMAP_URL).await?;
    let bytes = response.bytes().await?;

    let path = Path::new("resources/RamMap.zip");
    let mut file = File::create(&path)?;
    file.write_all(&bytes)?;

    Ok(path.to_str().unwrap().to_string())
}

#[command]
pub async fn ensure_rammap() -> Result<String, String> {
    let rammap_path = "resources/RamMap.exe";
    if !Path::new(rammap_path).exists() {
        // 다운로드 및 압축 해제
        let zip_path = download_rammap().await.map_err(|e| e.to_string())?;

        // ZIP 압축 해제 (여기서는 간단한 예시로 구현)
        use zip::ZipWriter;
        use zip::read::ZipArchive;
        use std::io::Cursor;
        let file = File::open(zip_path).map_err(|e| e.to_string())?;
        let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let outpath = Path::new(rammap_path);
            if file.name().ends_with('/') {
                std::fs::create_dir_all(outpath).map_err(|e| e.to_string())?;
            } else {
                let mut out_file = File::create(outpath).map_err(|e| e.to_string())?;
                std::io::copy(&mut file, &mut out_file).map_err(|e| e.to_string())?;
            }
        }

        Ok("RamMap downloaded and extracted.".to_string())
    } else {
        Ok("RamMap already exists.".to_string())
    }
}

#[command]
pub async fn execute_rammap_commands() -> Result<String, String> {
    let rammap_path = "resources/RamMap.exe";
    if !Path::new(rammap_path).exists() {
        return Err("RamMap executable not found. Please ensure it's downloaded.".to_string());
    }

    let commands = vec![
        "-e", // Empty Working Sets
        "-p", // Empty System Working Sets
        "-f", // Empty File Cache
        "-m", // Empty Modified Page List
        "-s", // Empty Standby List
    ];

    let mut output_string = String::new();
    for cmd in commands {
        let output = Command::new(rammap_path)
            .arg(cmd)
            .output()
            .map_err(|e| e.to_string())?;

        output_string.push_str(&format!(
            "Executed command {}: {}\n",
            cmd,
            String::from_utf8_lossy(&output.stdout)
        ));
    }

    Ok(output_string)
}
