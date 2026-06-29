# 1. Create an immutable ruleset from your local firestore.rules file
resource "google_firebaserules_ruleset" "firestore_rules" {
  project = var.gcp_project_id

  source {
    files {
      name    = "firestore.rules"
      content = file("${path.module}/firestore.rules")
    }
  }
}

# 2. Bind the ruleset to the Cloud Firestore service
resource "google_firebaserules_release" "firestore_release" {
  name         = "cloud.firestore" # This specific magic string targets the default Firestore database
  ruleset_name = google_firebaserules_ruleset.firestore_rules.name
  project      = var.gcp_project_id
}
