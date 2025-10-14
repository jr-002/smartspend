# Currency Auto-Detection Testing Guide

## How It Works

The app now automatically detects the user's currency based on their geographic location using the ipapi.co service.

## Features Implemented

1. **Automatic Currency Detection**
   - When a user first visits the app, it detects their location
   - Automatically sets the appropriate currency for their country
   - Falls back to USD if detection fails

2. **Cached Detection**
   - Detected currency is saved to localStorage
   - Reduces API calls on subsequent visits
   - User can still manually change currency in settings

3. **Country-to-Currency Mapping**
   - Supports 50+ countries and their currencies
   - Includes major regions: Americas, Europe, Asia, Africa, Middle East, Oceania

## Supported Countries

- **Americas**: US, Canada, Mexico, Brazil, Argentina, Chile, Colombia, Peru, Uruguay
- **Europe**: UK, Eurozone, Switzerland, Sweden, Norway, Denmark, Poland, Czech Republic, Hungary, Romania, Bulgaria, Croatia, Serbia, Russia, Ukraine, Turkey
- **Asia**: India, China, Japan, South Korea, Singapore, Hong Kong, Thailand, Malaysia, Indonesia, Pakistan, Bangladesh, Sri Lanka, Philippines
- **Africa**: Nigeria, South Africa, Kenya, Ghana, Egypt
- **Middle East**: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan, Lebanon
- **Oceania**: Australia, New Zealand

## Testing Instructions

1. **Test Auto-Detection**
   - Open the app in a fresh browser (or incognito mode)
   - The currency should automatically match your location
   - Check the sign-up form's currency selector

2. **Test Manual Override**
   - User can still manually select a different currency
   - The selection persists in their profile

3. **Test Fallback**
   - If geolocation fails, defaults to USD
   - No errors shown to user

## API Usage

- **Service**: ipapi.co (free tier)
- **Endpoint**: https://ipapi.co/json/
- **Rate Limit**: 30,000 requests/month (free)
- **No API key required**

## Privacy Note

The app only uses location data to determine currency. No personal location data is stored or transmitted beyond the initial detection.
