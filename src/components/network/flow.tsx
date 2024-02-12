import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";
import { api } from "~/utils/api";
import { ArtistNode } from "./node";

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const nodesTypes = { artist: ArtistNode };

export function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [limit, setLimit] = useState(1);

  api.graph.getGraph.useQuery(
    { limit },
    {
      onSuccess(data) {
        setNodes(
          data.nodes.map((n, i) => ({
            type: "artist",
            id: n.artistId!,
            data: { label: n.name!, image: n.image!, count: n.count },
            position: { x: (i % 50) * 100, y: (i % 10) * 50 },
          })),
        );

        setEdges(
          data.edges.map((e) => ({
            id: `${e.artistId}-${e.relatedArtistId}`,
            source: e.artistId,
            target: e.relatedArtistId,
          })),
        );
      },
    },
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "50vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodesTypes}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
