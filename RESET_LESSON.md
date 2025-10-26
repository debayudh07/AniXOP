# Reset Lesson Progress

To reset your AMM lesson progress and see it as a new lesson:

## Option 1: Use the API directly

Send a POST request to reset the lesson:

```bash
# Replace YOUR_TOKEN with your actual JWT token
# Replace 'amm' with the concept ID you want to reset

curl -X POST http://localhost:3000/api/auth/reset-lesson/amm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Option 2: Add a reset button in the frontend (coming soon)

A button can be added to the profile or concept page to reset lessons.

## Option 3: Direct database access

If you have MongoDB access, you can directly query and update:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $pull: { lessonProgress: { conceptId: "amm" } } }
)
```

## Concept IDs you can reset:

- `amm` - Automated Market Makers
- `lppools` - Liquidity Pools & LP Tokens  
- `snipping` - Token Sniping
- `defi` - Introduction to DeFi
- `yield-farming` - Yield Farming
- `impermanent-loss` - Impermanent Loss
- etc.

