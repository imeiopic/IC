# 1. Create an immutable ruleset from your local storage.rules file
resource "google_firebaserules_ruleset" "storage_rules" {
  project = var.gcp_project_id

  source {
    files {
      name    = "storage.rules"
      content = file("${path.module}/storage.rules")
    }
  }
}

# 2. Bind the ruleset to the Firebase Storage bucket
resource "google_firebaserules_release" "storage_release" {
  name         = "firebase.storage/${var.gcp_project_id}.appspot.com"
  ruleset_name = google_firebaserules_ruleset.storage_rules.name
  project      = var.gcp_project_id
}
