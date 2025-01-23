# Running Test Journeys

This document explains how to run the automated test journeys that capture the user flows through the application.

## Prerequisites

1. Make sure the development server is running:
```bash
npm run dev
```

2. Make sure you're logged in to Clerk in your development environment.

## Running the Journeys

### Step 1: Start the Browser

First, start a persistent browser instance that will be used by all journeys:

```bash
npm run browser
```

This will start a browser in non-headless mode and create a `.browser-ws-endpoint` file that the journeys will use to connect.

### Step 2: Run Individual Journeys

Test User: jacob.sunny@gmail.com
Test Password: Booki137

You can run any of the following journeys:

#### Journey 1: Provider Setup
Captures the initial provider setup process:
```bash
npm run journey1
```
- Creates provider profile
- Sets up business details
- Navigates through dashboard

#### Journey 2: Public Booking Page
Captures the public booking page view:
```bash
npm run journey2
```
- Views provider's public page
- Shows available services
- Displays business information

#### Journey 3: Service Setup
Captures the service creation process:
```bash
npm run journey3
```
- Navigates to services page
- Creates a new service
- Verifies service appears in list

#### Journey 4: Availability Setup
Captures the availability setup process:
```bash
npm run journey4
```
- Sets working hours
- Configures days of the week
- Saves availability settings

#### Journey 5: Customer Booking
Captures the customer booking flow:
```bash
npm run journey5
```
- Visits booking page
- Selects a service
- Books an appointment
- Receives confirmation

#### Journey 6: Appointment Management
Captures the appointment management flow:
```bash
npm run journey6
```
- Views upcoming appointments
- Checks appointment details
- Views booking statistics

### Viewing Results

After running a journey:
1. Screenshots are saved in the `screenshots/journey{N}` directory
2. Logs are saved in `logs/journey{N}.log`

### Troubleshooting

If you encounter issues:

1. **Browser Connection Error**
   - Make sure the browser is running (`npm run browser`)
   - Check that `.browser-ws-endpoint` exists
   - Restart the browser if needed

2. **Authentication Issues**
   - Ensure you're logged in to Clerk
   - Check that your environment variables are set correctly

3. **Element Not Found Errors**
   - Make sure the development server is running
   - Check that the page has loaded completely
   - Verify that you've completed prerequisite steps (e.g., profile setup before running service journeys)

4. **Clean State**
   If you want to start fresh:
   - Clear the Convex database
   - Log out and log back in
   - Run journeys in sequence (1 through 6)



## Future Enhancement: Web-based Journey Runner

### Overview
Create a web interface at `/dashboard/journeys` to manage and run test journeys with a visual interface.

### Features to Implement

1. **Browser Control Panel**
   - Status indicator (running/stopped)
   - Start/Stop browser buttons
   - Connection details
   - System status (memory usage, uptime)

2. **Journey Cards**
   ```typescript
   interface Journey {
     id: string;           // e.g., "journey1"
     name: string;         // e.g., "Provider Setup"
     description: string;
     steps: string[];
     lastRun?: {
       timestamp: Date;
       status: "success" | "error";
       duration: number;
     };
     prerequisites?: string[];
   }
   ```
   - Grid layout showing all journeys
   - Each card shows:
     - Journey name and description
     - Last run status and timestamp
     - Run button
     - Prerequisites
     - Expandable steps list

3. **Real-time Logs**
   - Streaming log output
   - Filterable by journey
   - Timestamp and log level indicators
   - Auto-scroll with pause option
   - Search functionality

4. **Screenshot Gallery**
   - Thumbnail grid of captured screenshots
   - Full-screen preview mode
   - Organized by journey and timestamp
   - Comparison view between runs

5. **Journey Controls**
   - Run single journey
   - Run multiple selected journeys
   - Run all journeys
   - Stop running journey
   - Clear results

### Technical Implementation

1. **Backend Requirements**
   ```typescript
   // API Routes needed:
   - POST /api/journeys/browser/start
   - POST /api/journeys/browser/stop
   - GET /api/journeys/browser/status
   - POST /api/journeys/run/:journeyId
   - GET /api/journeys/logs/:journeyId
   - GET /api/journeys/screenshots/:journeyId
   ```

2. **Frontend Structure**
   ```
   app/
     (dashboard)/
       journeys/
         page.tsx              // Main journeys page
         components/
           BrowserControl.tsx  // Browser controls
           JourneyCard.tsx     // Individual journey card
           LogViewer.tsx       // Real-time log viewer
           ScreenshotGallery.tsx
           StatusBadge.tsx
   ```

3. **State Management**
   ```typescript
   interface JourneyState {
     isRunning: boolean;
     currentJourney?: string;
     logs: Log[];
     screenshots: Screenshot[];
     browserStatus: {
       isRunning: boolean;
       startTime?: Date;
       endpoint?: string;
     };
   }
   ```

4. **Real-time Updates**
   - WebSocket connection for live logs
   - Server-sent events for journey status
   - File system watching for screenshots

### UI/UX Considerations

1. **Layout**
   ```
   +------------------------+
   |  Browser Control Panel |
   +------------------------+
   |  Journey Cards Grid    |
   |  [Card] [Card] [Card] |
   |  [Card] [Card] [Card] |
   +------------------------+
   |  Active Journey View   |
   |  +------------------+ |
   |  |    Log Viewer    | |
   |  +------------------+ |
   |  | Screenshot Grid  | |
   |  +------------------+ |
   +------------------------+
   ```

2. **Interactions**
   - Drag and drop to reorder journeys
   - Click to expand journey details
   - Double-click to run journey
   - Keyboard shortcuts for common actions

3. **Responsive Design**
   - Grid adjusts columns based on screen size
   - Collapsible panels for mobile
   - Touch-friendly controls
   - Accessible keyboard navigation

### Error Handling

1. **Common Scenarios**
   - Browser not started
   - Journey prerequisites not met
   - Network connectivity issues
   - File system permissions
   - Authentication errors

2. **Recovery Actions**
   - Auto-retry capabilities
   - Manual retry options
   - Clear state and restart
   - Detailed error reporting

### Future Enhancements

1. **Analytics**
   - Success/failure rates
   - Average run times
   - Common error patterns
   - Performance metrics

2. **CI/CD Integration**
   - GitHub Actions integration
   - Automated runs on PR
   - Status reporting
   - Screenshot diff comparisons

3. **Configuration**
   - Custom journey sequences
   - Environment management
   - Notification settings
   - Retention policies

This enhancement will provide a more user-friendly way to manage and monitor test journeys, making it easier to maintain and debug the application's core flows. 