# Selah Reflect App Scripts

This directory contains utility scripts for managing and maintaining the Selah Reflect application.

## Available Scripts

### Devotion Generation

These scripts help populate the Firestore database with devotion content for all dates.

- **generate-devotions.sh** - Shell script for generating devotions for a range of dates

  - Run this script to populate devotions for past, present, and future dates
  - Usage: `./scripts/generate-devotions.sh [start_date] [end_date]`
  - If no dates are provided, it defaults to 1 year before and after the current date

- **generate-devotions-direct.js** - Node.js implementation of devotion generator

  - This is the core implementation that the shell script wraps
  - Can be run directly: `node scripts/generate-devotions-direct.js [start_date] [end_date]`
  - Supports both service account file and environment variables for authentication

- **ensure-today.sh** - Shell script to ensure today's devotion exists

  - Run this script to verify and, if needed, generate today's devotion
  - Usage: `./scripts/ensure-today.sh`
  - This is useful to run as a daily task or before starting the app

- **generate-today.js** - Node.js script to specifically generate today's devotion

  - Generates devotions for yesterday, today, and tomorrow
  - Usage: `node scripts/generate-today.js`
  - More focused than the full range generator

- **verify-devotion.js** - Node.js script to verify today's devotion exists
  - Checks if today's devotion is in the database
  - Usage: `node scripts/verify-devotion.js`
  - Shows details of the devotion if it exists

## Documentation

For more detailed information, refer to these guides:

- **DEVOTION-GENERATOR.md** - Complete guide on generating devotions
- **HOW-TO-GET-SERVICE-ACCOUNT.md** - Instructions for obtaining Firebase credentials

## Best Practices

- Run `./scripts/ensure-today.sh` daily before using the app
- Run the full devotion generator (`generate-devotions.sh`) monthly to ensure future dates are always populated
- Use the shell scripts for the best experience
- For production environments, use environment variables instead of service account files
- Never commit service account keys to version control
