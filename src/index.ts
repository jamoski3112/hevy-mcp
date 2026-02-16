import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";

const API_KEY = process.env.HEVY_API_KEY;
const BASE_URL = "https://api.hevyapp.com/v1";

if (!API_KEY) {
  console.error("HEVY_API_KEY environment variable is required");
  process.exit(1);
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "api-key": API_KEY,
    "Content-Type": "application/json",
  },
});

const server = new Server(
  {
    name: "hevy-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Schemas
const PaginationSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(5),
});

const DateFilterSchema = z.object({
  since: z.string().optional(),
});

// Enums
const SetTypeSchema = z.enum(["warmup", "normal", "failure", "dropset"]);
const CustomExerciseTypeSchema = z.enum([
  "weight_reps",
  "reps_only",
  "bodyweight_reps",
  "bodyweight_assisted_reps",
  "duration",
  "weight_duration",
  "distance_duration",
  "short_distance_weight",
]);
const EquipmentCategorySchema = z.enum([
  "none",
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "plate",
  "resistance_band",
  "suspension",
  "other",
]);
const MuscleGroupSchema = z.enum([
  "abdominals",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "calves",
  "glutes",
  "abductors",
  "adductors",
  "lats",
  "upper_back",
  "traps",
  "lower_back",
  "chest",
  "cardio",
  "neck",
  "full_body",
  "other",
]);

// Shared Objects
const WorkoutSetSchema = z.object({
  type: SetTypeSchema,
  weight_kg: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  distance_meters: z.number().int().nullable().optional(),
  duration_seconds: z.number().int().nullable().optional(),
  custom_metric: z.number().nullable().optional(),
  rpe: z.number().nullable().optional(),
});

const WorkoutExerciseSchema = z.object({
  exercise_template_id: z.string(),
  superset_id: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(WorkoutSetSchema),
});

const RoutineSetSchema = z.object({
  type: SetTypeSchema,
  weight_kg: z.number().nullable().optional(),
  reps: z.number().int().nullable().optional(),
  distance_meters: z.number().int().nullable().optional(),
  duration_seconds: z.number().int().nullable().optional(),
  custom_metric: z.number().nullable().optional(),
  rep_range: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .nullable()
    .optional(),
});

const RoutineExerciseSchema = z.object({
  exercise_template_id: z.string(),
  superset_id: z.number().nullable().optional(),
  rest_seconds: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(RoutineSetSchema),
});

// Request Bodies
const CreateWorkoutSchema = z.object({
  workout: z.object({
    title: z.string(),
    description: z.string().nullable().optional(),
    start_time: z.string(),
    end_time: z.string(),
    is_private: z.boolean().optional(),
    exercises: z.array(WorkoutExerciseSchema),
  }),
});

const CreateRoutineSchema = z.object({
  routine: z.object({
    title: z.string(),
    folder_id: z.number().nullable().optional(),
    notes: z.string().optional(),
    exercises: z.array(RoutineExerciseSchema),
  }),
});

const UpdateRoutineSchema = z.object({
  routine: z.object({
    title: z.string(),
    notes: z.string().nullable().optional(),
    exercises: z.array(RoutineExerciseSchema),
  }),
});

const CreateCustomExerciseSchema = z.object({
  exercise: z.object({
    title: z.string(),
    exercise_type: CustomExerciseTypeSchema,
    equipment_category: EquipmentCategorySchema,
    muscle_group: MuscleGroupSchema,
    other_muscles: z.array(MuscleGroupSchema).optional(),
  }),
});

const UpdateRoutineFolderSchema = z.object({
    routine_folder: z.object({
        title: z.string(),
    }),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Received ListToolsRequest");
  return {
    tools: [
      {
        name: "get_workouts",
        description: "Get a paginated list of workouts",
        inputSchema: zodToJsonSchema(PaginationSchema),
      },
      {
        name: "get_workout_count",
        description: "Get the total number of workouts on the account",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_single_workout",
        description: "Get a single workout’s complete details by the workoutId",
        inputSchema: zodToJsonSchema(
          z.object({
            workoutId: z.string().uuid(),
          })
        ),
      },
      {
        name: "delete_workout",
        description: "Delete a workout by its workoutId",
        inputSchema: zodToJsonSchema(
            z.object({
                workoutId: z.string().uuid()
            })
        )
      },
      {
        name: "get_workout_events",
        description:
          "Retrieve a paged list of workout events (updates or deletes) since a given date",
        inputSchema: zodToJsonSchema(
          PaginationSchema.merge(DateFilterSchema)
        ),
      },
      {
        name: "get_routines",
        description: "Get a paginated list of routines",
        inputSchema: zodToJsonSchema(PaginationSchema),
      },
      {
        name: "get_single_routine",
        description: "Get a routine by its Id",
        inputSchema: zodToJsonSchema(
          z.object({
            routineId: z.string().uuid(),
          })
        ),
      },
      {
        name: "delete_routine",
        description: "Delete a routine by its routineId",
        inputSchema: zodToJsonSchema(
            z.object({
                routineId: z.string().uuid()
            })
        )
      },
      {
        name: "get_routine_folders",
        description: "Get a paginated list of routine folders",
        inputSchema: zodToJsonSchema(PaginationSchema),
      },
      {
        name: "create_routine_folder",
        description: "Create a new routine folder",
        inputSchema: zodToJsonSchema(
          z.object({
            title: z.string(),
          })
        ),
      },
      {
        name: "update_routine_folder",
        description: "Update an existing routine folder",
        inputSchema: zodToJsonSchema(
            z.object({
                folderId: z.union([z.string(), z.number()]),
                title: z.string()
            })
        )
      },
      {
        name: "delete_routine_folder",
        description: "Delete a routine folder by its folderId",
        inputSchema: zodToJsonSchema(
            z.object({
                folderId: z.union([z.string(), z.number()])
            })
        )
      },
      {
        name: "get_exercise_templates",
        description: "Get a paginated list of exercise templates",
        inputSchema: zodToJsonSchema(PaginationSchema),
      },
      {
        name: "get_single_exercise_template",
        description: "Get a single exercise template by id",
        inputSchema: zodToJsonSchema(
          z.object({
            exerciseTemplateId: z.string(),
          })
        ),
      },
      {
        name: "delete_exercise_template",
        description: "Delete a custom exercise template by its id",
        inputSchema: zodToJsonSchema(
            z.object({
                exerciseTemplateId: z.string()
            })
        )
      },
       {
        name: "get_exercise_history",
        description: "Get exercise history for a specific exercise template",
        inputSchema: zodToJsonSchema(
             z.object({
                exerciseTemplateId: z.string(),
                start_date: z.string().optional(),
                end_date: z.string().optional()
            })
        ),
      },
      {
        name: "create_workout",
        description: "Create a new workout",
        inputSchema: zodToJsonSchema(CreateWorkoutSchema),
      },
      {
        name: "update_workout",
        description: "Update an existing workout",
        inputSchema: zodToJsonSchema(
          z.object({
            workoutId: z.string().uuid(),
            workout: CreateWorkoutSchema.shape.workout,
          })
        ),
      },
      {
        name: "create_routine",
        description: "Create a new routine",
        inputSchema: zodToJsonSchema(CreateRoutineSchema),
      },
      {
        name: "update_routine",
        description: "Update an existing routine",
        inputSchema: zodToJsonSchema(
          z.object({
            routineId: z.string().uuid(),
            routine: UpdateRoutineSchema.shape.routine,
          })
        ),
      },
      {
        name: "create_exercise_template",
        description: "Create a new custom exercise template",
        inputSchema: zodToJsonSchema(CreateCustomExerciseSchema),
      },
      {
        name: "get_single_routine_folder",
        description: "Get a single routine folder by id",
        inputSchema: zodToJsonSchema(
          z.object({
            folderId: z.union([z.string(), z.number()]),
          })
        ),
      },
      {
        name: "get_user_info",
        description: "Get user info",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`Received CallToolRequest: ${name}`);

  try {
    switch (name) {
      case "get_workouts": {
        const { page, pageSize } = PaginationSchema.parse(args);
        const response = await apiClient.get("/workouts", {
          params: { page, pageSize },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_workout_count": {
        const response = await apiClient.get("/workouts/count");
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_single_workout": {
        const { workoutId } = z
          .object({ workoutId: z.string().uuid() })
          .parse(args);
        const response = await apiClient.get(`/workouts/${workoutId}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "delete_workout": {
          const { workoutId } = z.object({ workoutId: z.string().uuid() }).parse(args);
          const response = await apiClient.delete(`/workouts/${workoutId}`);
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "get_workout_events": {
         const { page, pageSize, since } = PaginationSchema.merge(DateFilterSchema).parse(args);
         const response = await apiClient.get("/workouts/events", {
             params: { page, pageSize, since }
         });
         return {
             content: [{ type: "text", text: JSON.stringify(response.data)}]
         }
      }

      case "get_routines": {
        const { page, pageSize } = PaginationSchema.parse(args);
        const response = await apiClient.get("/routines", {
          params: { page, pageSize },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_single_routine": {
        const { routineId } = z
          .object({ routineId: z.string().uuid() })
          .parse(args);
        const response = await apiClient.get(`/routines/${routineId}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "delete_routine": {
          const { routineId } = z.object({ routineId: z.string().uuid() }).parse(args);
          const response = await apiClient.delete(`/routines/${routineId}`);
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "get_routine_folders": {
        const { page, pageSize } = PaginationSchema.parse(args);
        const response = await apiClient.get("/routine_folders", {
          params: { page, pageSize },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "create_routine_folder": {
        const { title } = z.object({ title: z.string() }).parse(args);
        const response = await apiClient.post("/routine_folders", {
          routine_folder: { title },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "update_routine_folder": {
          const { folderId, title } = z.object({ 
              folderId: z.union([z.string(), z.number()]), 
              title: z.string() 
          }).parse(args);
          const response = await apiClient.put(`/routine_folders/${folderId}`, {
              routine_folder: { title }
          });
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "delete_routine_folder": {
          const { folderId } = z.object({ folderId: z.union([z.string(), z.number()]) }).parse(args);
          const response = await apiClient.delete(`/routine_folders/${folderId}`);
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "get_exercise_templates": {
        const { page, pageSize } = PaginationSchema.parse(args);
        const response = await apiClient.get("/exercise_templates", {
          params: { page, pageSize },
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_single_exercise_template": {
        const { exerciseTemplateId } = z
          .object({ exerciseTemplateId: z.string() })
          .parse(args);
        const response = await apiClient.get(
          `/exercise_templates/${exerciseTemplateId}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "delete_exercise_template": {
          const { exerciseTemplateId } = z.object({ exerciseTemplateId: z.string() }).parse(args);
          const response = await apiClient.delete(`/exercise_templates/${exerciseTemplateId}`);
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "get_exercise_history": {
          const { exerciseTemplateId, start_date, end_date } = z.object({
              exerciseTemplateId: z.string(),
              start_date: z.string().optional(),
              end_date: z.string().optional()
          }).parse(args);
          const response = await apiClient.get(`/exercise_history/${exerciseTemplateId}`, {
              params: { start_date, end_date }
          });
          return {
              content: [{ type: "text", text: JSON.stringify(response.data) }]
          };
      }
      case "create_workout": {
        const { workout } = CreateWorkoutSchema.parse(args);
        const response = await apiClient.post("/workouts", { workout });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "update_workout": {
        const { workoutId, workout } = z.object({
            workoutId: z.string().uuid(),
            workout: CreateWorkoutSchema.shape.workout
        }).parse(args);
        const response = await apiClient.put(`/workouts/${workoutId}`, { workout });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "create_routine": {
        const { routine } = CreateRoutineSchema.parse(args);
        const response = await apiClient.post("/routines", { routine });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "update_routine": {
        const { routineId, routine } = z.object({
            routineId: z.string().uuid(),
            routine: UpdateRoutineSchema.shape.routine
        }).parse(args);
        const response = await apiClient.put(`/routines/${routineId}`, { routine });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "create_exercise_template": {
        const { exercise } = CreateCustomExerciseSchema.parse(args);
        const response = await apiClient.post("/exercise_templates", { exercise });
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_single_routine_folder": {
        const { folderId } = z.object({ folderId: z.union([z.string(), z.number()]) }).parse(args);
        const response = await apiClient.get(`/routine_folders/${folderId}`);
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      case "get_user_info": {
        const response = await apiClient.get("/user/info");
        return {
          content: [{ type: "text", text: JSON.stringify(response.data) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid arguments: ${JSON.stringify(error.issues)}`);
    }
    // Axios error handling
    if (error.response) {
         return {
            content: [{ type: "text", text: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` }],
            isError: true,
         };
    }

    throw error;
  }
});

function zodToJsonSchema(schema: any): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: any = {};
    const required: string[] = [];

    for (const key in shape) {
      const field = shape[key];
      properties[key] = zodToJsonSchema(field);
      if (!field.isOptional()) {
        required.push(key);
      }
    }
    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element),
    };
  }
  if (schema instanceof z.ZodString) {
      const isUUID = schema._def.checks?.some((check: any) => check.kind === "uuid");
      if (isUUID) {
          return { type: "string", format: "uuid" }
      }
      return { type: "string" };
  }
  if (schema instanceof z.ZodNumber) return { type: "number" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodEnum) {
    return { type: "string", enum: schema.options };
  }
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    return zodToJsonSchema(schema._def.innerType);
  }
  if (schema instanceof z.ZodUnion) {
      // Return the first option as a best-effort schema derivation
      return zodToJsonSchema(schema._def.options[0]);
  }
  if (schema instanceof z.ZodNullable) {
      return zodToJsonSchema(schema._def.innerType);
  }
  
  return { type: "string" }; // Fallback
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
