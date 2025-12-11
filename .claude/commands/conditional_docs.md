# Conditional Documentation Guide

This prompt helps you determine what documentation you should read based on the specific changes you need to make in the codebase. Review the conditions below and read the relevant documentation before proceeding with your task.

## Instructions
- Review the task you've been asked to perform
- Check each documentation path in the Conditional Documentation section
- For each path, evaluate if any of the listed conditions apply to your task
  - IMPORTANT: Only read the documentation if any one of the conditions match your task
- IMPORTANT: You don't want to excessively read documentation. Only read the documentation if it's relevant to your task.

## Conditional Documentation

- README.md
  - Conditions:
    - When operating on anything under src/*
    - When first understanding the project structure
    - When you want to learn the commands to start or stop the server or client

- adws/README.md
  - Conditions:
    - When you're operating in the `adws/` directory

- app_docs/feature-adw_1001-ticket-types-persistence.md
  - Conditions:
    - When working with ticket types in the admin event editor
    - When implementing ticketing features or Neon sync for tickets
    - When troubleshooting ticket type save/load issues
    - When modifying TicketingSection or TicketTypeCard components
    - When working with price conversion between UI and database

- app_docs/feature-swagger-api-docs.md
  - Conditions:
    - When working with API documentation at /docs/api
    - When modifying Swagger UI configuration or styling
    - When updating OpenAPI specifications (public-api.yaml or admin-api.yaml)
    - When adding new API endpoints that need documentation
    - When troubleshooting the API documentation interface

- app_docs/bugfix-event-history-timestamps-preservation.md
  - Conditions:
    - When working with event metadata (createdAt, createdBy, publishedAt, publishedBy)
    - When modifying runPublishEventPipeline or the publish event flow
    - When troubleshooting Event History timestamp display issues
    - When implementing metadata preservation for Sanity documents

- app_docs/bugfix-adw_1002-autosave-504-timeout-disabled.md
  - Conditions:
    - When working with event form autosave functionality
    - When re-enabling or modifying autosave behavior
    - When troubleshooting 504 timeout errors in the admin event editor
    - When modifying EventCreationForm autosave triggers

- app_docs/bugfix-invalid-sanity-document-id-nanoid.md
  - Conditions:
    - When generating Sanity document IDs for events
    - When working with nanoid or ID generation in Sanity operations
    - When troubleshooting "Invalid document ID" errors during event publish
    - When modifying src/lib/sanity/identifiers.ts
    - When adding new Sanity document types that need ID generation

- app_docs/bugfix-swagger-admin-api-ticketing-documentation.md
  - Conditions:
    - When working with Admin API Swagger documentation at /docs/api
    - When updating ticketing schemas in admin-api.yaml
    - When adding new ticketing fields to event creation/update endpoints
    - When troubleshooting missing ticketing documentation in API docs
    - When understanding the ticketing model for API integration

- app_docs/chore-admin-events-table-fixes.md
  - Conditions:
    - When working with the admin events table or EventInfoCell component
    - When modifying date filtering in buildAdminEventsFilter()
    - When troubleshooting user-submitted event avatars or tooltips
    - When working with submittedBy metadata for public form submissions
    - When modifying GROQ date range filters for events

- app_docs/feature-initial-project-setup.md
  - Conditions:
    - When first understanding the Ourchother project structure
    - When setting up the development environment
    - When working with Supabase configuration or migrations
    - When implementing new features that span admin/client/public routes
    - When troubleshooting authentication flow (admin or client portal)

- app_docs/feature-remove-internal-external-distinction.md
  - Conditions:
    - When working with project types (internal vs external)
    - When creating or modifying project forms
    - When filtering projects by client or type
    - When working with the OURCHOTHER_CLIENT_ID constant
    - When running database migrations for the projects table
    - When troubleshooting project client_id validation errors

- app_docs/feature-landing-page.md
  - Conditions:
    - When modifying the landing page at src/app/page.tsx
    - When working with the organic color system (soil, sand, leaf colors)
    - When adding or modifying service cards
    - When working with Iconify/Clarity icons
    - When updating fonts or typography
    - When modifying CSS animations in globals.css
