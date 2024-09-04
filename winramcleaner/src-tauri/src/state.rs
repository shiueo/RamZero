use std::sync::{Arc, Mutex};
use chrono::Utc;

#[derive(Clone)]
pub struct AppState {
    pub next_execution: Arc<Mutex<chrono::DateTime<Utc>>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            next_execution: Arc::new(Mutex::new(Utc::now())),
        }
    }
}
