# DailyRoutinePro AI
An intelligent full-stack daily routine manager and personal productivity assistant featuring persistent data storage, real-time audio-visual notifications, and localized weather insights.

## About the App
DailyRoutinePro AI is an advanced, responsive web application engineered to help students, professionals, and remote teams manage their days with precision and ease. It solves the cognitive overload of unstructured routines by providing real-time task categorization, visual progress reports, and persistent secure data storage synchronized with Cloud Firestore database systems. Additionally, the app features direct environment integrations including local weather reports and live high-frequency bell reminders to ensure user actions are streamlined and never forgotten.

## App Screenshots
To display these actual app screenshots when you push your project to GitHub:
1. Create a folder named `screenshots` in the root of your project directory.
2. Save your screenshots with the specified filenames below and copy them into that folder.
3. Push your repository to GitHub, and they will load perfectly below!

### 💻 Main Application Views

| 1. Dashboard Overview | 2. Daily Planner View | 3. Habit Tracker |
|:---:|:---:|:---:|
| ![Dashboard Overview]<img width="1873" height="865" alt="dashboard_overview png" src="https://github.com/user-attachments/assets/dbd8b9bc-46d3-418b-9bb2-617c27aa4f7d" />
 | ![Daily Planner]<img width="1845" height="764" alt="daily_planner png" src="https://github.com/user-attachments/assets/3ee562df-2444-40ec-a847-e16ffdb169fb" />
) | ![Habit Tracker]<img width="1868" height="853" alt="habit_tracker png" src="https://github.com/user-attachments/assets/d1813501-280e-4e90-8e7f-befb1dfa2636" />
 |
| *Personalized hello greeting with score stats, OpenWeather integration & live tracking indicators.* | *Interactive task checklist showcasing 'walk' and 'remote work' alongside custom guide panels.* | *Interactive hydration, sleep, and step cards with weekly streak checkmarks.* |

| 4. Alarms & Reminders | 5. Analytics Laboratory | 6. AI Coaching Desk |
|:---:|:---:|:---:|
| ![Alarms and Reminders](<img width="1878" height="853" alt="alarms_reminder png" src="https://github.com/user-attachments/assets/2728f594-2585-4f12-a4fb-1b7fdf9c9aa3" />
 | ![Analytics Laboratory]<img width="1819" height="860" alt="analytics_laboratory png" src="https://github.com/user-attachments/assets/29c0622f-b553-4490-a305-ccda912cc6df" />
 |
| *Systematic bell reminder configurations with browser alert switches and list managers.* | *Average progression summaries, water/sleep ratios, and task domain analysis charts.* | *Context-aware conversation simulator powered by the server-side API configurations.* |

## Features
- **User Authentication**: Secure signup and signin workflow powered by Firebase Auth.
- **Dynamic Dashboard**: Central hub displaying your current activity progress, time, and tasks statistics.
- **Interactive Multi-Category Tasks**: Seamlessly filter and track Goals, Exercises, Habits, and Study notes with custom tags.
- **Active Task Bell Alarm**: Integrated Web Audio API chime with high-frequency dings and temporary pop-up reminders when scheduled tasks are due.
- **Micro-Weather Widget**: Powered by OpenWeatherMap API for live temperature indicators and customized daily recommendations.
- **Durable Persistent Storage**: Cloud Firestore integrated, safeguarding your history data against session resets.
- **Sleek Micro-Animations**: Smooth entry transitions and interactive feedback powered by Tailwind and motion animations.

## Technologies Used
- **Frontend Framework**: React 19, TSX, Vite Bundler, TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Tailwind-Merge
- **Transitions/Animations**: motion (React) 
- **Backend API Server**: Node.js, Express.js
- **Database Backend**: Firebase Firestore (NoSQL cloud store)
- **Security & Authorization**: Firebase Security Rules, Firebase Client SDK
- **External API Gateways**: OpenWeatherMap API, Google Gemini AI SDK

## Live App Access
Since this is a full-stack, responsive web application rather than a native mobile application, it is available across any mobile, tablet, or desktop device via a web browser:
- [Launch DailyRoutinePro AI](https://ais-pre-rf4qixvgb44l6a2tysbsqv-514100615006.asia-southeast1.run.app)

## How to Install the App
1. Open your web browser on any Android mobile phone, tablet, or computer.
2. Navigate to the [Shared Live Link](https://ais-pre-rf4qixvgb44l6a2tysbsqv-514100615006.asia-southeast1.run.app).
3. Tap **"Add to Home Screen"** or **"Install Lite App"** from your browser options to install the Progressive web shortcut wrapper on your mobile device.
4. Allow permission for **Notifications** and **Location Services** if prompted by the web client to activate real-time alarms and weather widgets.

## How to Run the Project
1. Clone or download this project file structure.
2. Navigate to the root directory and install node packages:
   ```bash
   npm install
   ```
3. Set up your Environment Credentials in `.env`:
   ```env
   # .env
   OPENWEATHER_API_KEY=757440c426f0ab122446f245d62dda8f
   GEMINI_API_KEY=<your_gemini_key>
   ```
4. Run the local full-stack server under development mode:
   ```bash
   npm run dev
   ```
5. Open your web browser and search: `http://localhost:3000`
6. Synchronize or connect Firebase credentials via the Firebase integration setup panel inside AI Studio as needed.

## Demo Video
- [Watch Live App Interface](https://ais-pre-rf4qixvgb44l6a2tysbsqv-514100615006.asia-southeast1.run.app)

## Privacy Policy
Any user registration information, log activity timestamps, and task categories reside in your local browser state storage and safe Firestore sandboxes. General location queries used for retrieving coordinate weather are processed anonymously via proxy APIs on behalf of the client.
- [View Full Privacy Policy Specs](https://ais-pre-rf4qixvgb44l6a2tysbsqv-514100615006.asia-southeast1.run.app)

## Future Enhancements
- **Intelligent Category Organization**: Add smart categorization driven automatically by Gemini AI.
- **Google Sheets Synchronizations**: Export completed routine logs and habits data to Google Sheets automatically.
- **Historical Analysis Graphs**: Implement charts to visualize daily performance streaks.
- **Admin Management Panel**: Introduce admin portals to moderate complex group routines.

## Developed By
- **Uzain Sadiq Ali**
- **Bilal Khan**
- BS Information Technology (6th Semester)
- Department of Information Technology, University of Layyah
