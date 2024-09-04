// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tokio::time;
use tauri::Manager;

mod commands;
mod state;

#[tokio::main]
async fn main() {
  let app_state = state::AppState::new();

  tauri::Builder::default()
      .manage(app_state.clone())
      .invoke_handler(tauri::generate_handler![
        commands::ensure_rammap,
        commands::execute_rammap_commands
      ])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");

  loop {
      let mut next_execution = app_state.next_execution.lock().unwrap();
      *next_execution = chrono::Utc::now() + chrono::Duration::hours(1);

      commands::execute_rammap_commands().await.expect("Failed to execute commands");

      time::sleep(Duration::from_secs(60 * 60)).await;
  }
}
