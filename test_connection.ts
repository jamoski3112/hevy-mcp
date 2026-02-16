import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["/Users/dda500264/Desktop/dash/hevy-mcp-server/dist/index.js"],
    env: {
      "HEVY_API_KEY": "582f872a-d1d7-4ebe-8dbb-0ecc5bda3848"
    }
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  console.log("Connecting to Hevy MCP Server...");
  await client.connect(transport);
  console.log("Connected!");

  console.log("Listing tools...");
  const tools = await client.listTools();
  console.log(`Found ${tools.tools.length} tools.`);
  
  // Print tool names
  tools.tools.forEach(tool => {
      console.log(`- ${tool.name}`);
  });

  console.log("\nTesting 'get_workout_count'...");
  const result = await client.callTool({
      name: "get_workout_count",
      arguments: {}
  });
  
  // @ts-ignore
  console.log("Result:", result.content[0].text);

  await client.close();
}

main().catch(console.error);
