@echo off
cd /d "%~dp0"
npx.cmd prisma migrate dev --name add_event_assistants --schema prisma/schema.prisma --skip-generate
