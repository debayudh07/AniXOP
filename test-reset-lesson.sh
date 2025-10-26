#!/bin/bash

# Test script to reset AMM lesson
# Make sure you have your JWT token

echo "To reset the AMM lesson, run this command:"
echo ""
echo "curl -X POST http://localhost:3000/api/auth/reset-lesson/amm \\"
echo '  -H "Authorization: Bearer YOUR_TOKEN_HERE" \'
echo '  -H "Content-Type: application/json"'
echo ""
echo "Or for PowerShell:"
echo 'Invoke-RestMethod -Uri "http://localhost:3000/api/auth/reset-lesson/amm" -Method POST -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"}'

