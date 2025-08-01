# Apify Actor Runner

A web application that allows users to authenticate with their Apify API key, select actors, configure input parameters dynamically, and execute single actor runs with immediate results.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Apify API account and token

### Installation

```sh
# Clone the repository
git clone <https://github.com/yashjadhav1595-projects/apify-run-buddy.git>

# Navigate to project directory
cd <api-run-buddy>

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **ApifyRunner**: Main application component
- **TokenInput**: Secure API key authentication
- **ActorSelector**: Browse and select available actors
- **DynamicForm**: Runtime schema-based form generation
- **ResultDisplay**: Execution results and error handling

### Backend (Supabase Edge Functions)
- **validate-token**: Authenticates Apify API keys
- **list-actors**: Fetches user's available actors
- **get-actor-schema**: Retrieves actor input schemas
- **run-actor**: Executes single actor runs

## 🎯 Key Features

### ✅ Dynamic Schema Loading
Schemas are fetched at runtime for any actor the user selects—no pre-stored definitions.

### ✅ Single-Run Execution  
Performs exactly one actor execution per request with immediate result presentation.

### ✅ Comprehensive Error Handling
Clear feedback for invalid keys, schema mismatches, and execution failures.

### ✅ Secure API Integration
All Apify API communication handled securely through backend functions.

## 🧪 Testing

### Recommended Test Actor
**Actor**: `apify/web-scraper`
- **Purpose**: Website content extraction
- **Why**: Well-documented, reliable, and demonstrates complex input schemas

### Test Flow
1. Enter your Apify API token
2. Select the `apify/web-scraper` actor
3. Configure input parameters (URL, selectors, etc.)
4. Execute and view scraped results

## 🎨 Design Choices

### Architecture Decisions
- **Supabase Edge Functions**: Chosen for secure API key handling and serverless scaling
- **React Query**: Implements efficient caching and error handling for API calls
- **Dynamic Form Generation**: Uses JSON Schema to automatically create appropriate input fields

### Security Considerations
- API tokens never exposed to frontend
- All Apify API calls proxied through secure backend functions
- Input validation based on actor schemas

### User Experience
- Progressive disclosure: Token → Actor → Schema → Execution → Results
- Real-time feedback with loading states and error messages
- Responsive design with clean, intuitive interface

## 📸 Application Flow

1. **Authentication**: User enters Apify API token
2. **Actor Selection**: Browse available actors with descriptions
3. **Configuration**: Dynamic form based on selected actor's schema
4. **Execution**: Single-click execution with real-time status
5. **Results**: Immediate display of execution results or error details

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions (Deno)
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form with dynamic validation
- **Build Tool**: Vite



### Required Secrets (Supabase)
- `APIFY_API_TOKEN`: Your Apify API token for backend operations

### Configuration
All API endpoints and configurations are handled automatically through the Supabase integration.

## 📋 Assignment Requirements Checklist

- ✅ **Web Frontend**: Authentication, actor selection, schema presentation, execution trigger
- ✅ **Backend Integration**: Secure Apify API communication
- ✅ **Dynamic Schema Loading**: Runtime schema fetching and form generation
- ✅ **Single-Run Execution**: One execution per request with immediate results
- ✅ **Error Handling**: Comprehensive error feedback and user guidance
- ✅ **Minimal Dependencies**: Clean, focused solution without unnecessary complexity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request with detailed description

## 📄 License

This project is part of an integration developer assignment and is provided as-is for evaluation purposes.
