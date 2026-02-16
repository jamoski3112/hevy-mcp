# Hevy MCP Server

This is a Model Context Protocol (MCP) server that provides an interface to the [Hevy Workout Tracker](https://www.hevy.com/) API. It allows AI agents and other MCP clients to interact with your Hevy data, including workouts, routines, exercises, and user information.

## Prerequisites

- Node.js (v18 or higher recommended)
- NPM
- A **Hevy Pro** account.
- A **Hevy API Key**. You can obtain your key by visiting the [Hevy web app developer settings](https://hevy.com/settings?developer).

## Installation

1. Navigate to the project directory:
   ```bash
   cd hevy-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

The server requires a Hevy API key to function. This key must be provided as an environment variable `HEVY_API_KEY`.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HEVY_API_KEY` | Your personal Hevy API Key. | Yes |

## Usage

### Running the Server

To start the server directly:

```bash
export HEVY_API_KEY=your_api_key_here
npm start
```

### Using with an MCP Client (e.g., Claude Desktop, Gemini)

Add the server configuration to your MCP client's configuration file (e.g., `claude_desktop_config.json` or similar).

**Example Configuration:**

```json
{
  "mcpServers": {
    "hevy": {
      "command": "node",
      "args": [
        "/absolute/path/to/hevy-mcp-server/dist/index.js"
      ],
      "env": {
        "HEVY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

*Note: Replace `/absolute/path/to/...` with the actual full path to the `dist/index.js` file on your system.*

## Available Tools

This server exposes the following tools to MCP clients:

### Workouts
- **`get_workouts`**: Get a paginated list of workouts.
- **`get_single_workout`**: Get complete details of a single workout by UUID.
- **`get_workout_count`**: Get the total number of workouts.
- **`create_workout`**: Create a new workout.
- **`update_workout`**: Update an existing workout.
- **`delete_workout`**: Delete a workout by UUID.
- **`get_workout_events`**: Retrieve workout events (updates/deletes) since a specific date.

### Routines
- **`get_routines`**: Get a paginated list of routines.
- **`get_single_routine`**: Get details of a single routine by UUID.
- **`create_routine`**: Create a new routine.
- **`update_routine`**: Update an existing routine.
- **`delete_routine`**: Delete a routine by UUID.

### Routine Folders
- **`get_routine_folders`**: Get a paginated list of routine folders.
- **`get_single_routine_folder`**: Get details of a routine folder.
- **`create_routine_folder`**: Create a new routine folder.
- **`update_routine_folder`**: Update a routine folder's title.
- **`delete_routine_folder`**: Delete a routine folder.

### Exercises
- **`get_exercise_templates`**: Get a paginated list of exercise templates (built-in and custom).
- **`get_single_exercise_template`**: Get details of a specific exercise template.
- **`create_exercise_template`**: Create a new custom exercise template.
- **`delete_exercise_template`**: Delete a custom exercise template.
- **`get_exercise_history`**: Get history for a specific exercise template.

### User
- **`get_user_info`**: Get information about the authenticated user.

## Development

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist` folder.
- **Start**: `npm start` - Runs the compiled server from `dist/index.js`.
