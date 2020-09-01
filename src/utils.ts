import vis, { IdType, Position } from "vis-network";
import { Data, Edge } from "./simulator/fast-data";
import { v4 as uuidv4 } from "uuid";
interface NodeEdge {
  x: number;
  y: number;
  id: string;
  connections: Array<IdType>;
  group: number | undefined;
}

interface ImportedNode {
  id: number;
  title: string;
  x: number;
  y: number;
  group: number;
}

function objectToArray(obj: { [nodeId: string]: Position }) {
  return Object.keys(obj).map((key) => {
    obj[key]["id"] = key;
    return obj[key];
  });
}

export function exportNetwork(network: vis.Network) {
  function addConnections(elem: NodeEdge, index: number) {
    elem.connections = network.getConnectedNodes(index) as Array<IdType>;
  }

  const nodes: vis.Node[] = objectToArray(network.getPositions());
  //@ts-ignore
  nodes.forEach(addConnections);

  const exportValue = JSON.stringify(nodes, undefined, 2);
  console.log(exportValue);
}

export function importNetwork(inputData: NodeEdge[]): Data {
  /* var inputData: NodeEdge[] = JSON.parse(inputValue); */
  const data = new Data(getNodeData(inputData), getEdgeData(inputData));
  data.buildAdjacentList();
  return data;
}

function getNodeData(data: NodeEdge[]): Array<ImportedNode> {
  var networkNodes = new Array<ImportedNode>();

  data.forEach((elem) => {
    networkNodes.push({
      id: Number(elem.id),
      title: elem.id,
      x: elem.x,
      y: elem.y,
      group: elem.group || 0,
    });
  });
  console.log(`restored ${networkNodes.length} nodes`);

  return networkNodes;
}

function getEdgeData(data: NodeEdge[]): Map<string, Edge> {
  var networkEdges: Map<string, Edge> = new Map<string, Edge>();

  data.forEach((node: NodeEdge) => {
    // add the connection
    node.connections.forEach((connId: string | number) => {
      const id = uuidv4();
      networkEdges.set(id, { id, from: Number(node.id), to: Number(connId) });
      let cNode = getNodeById(data, connId);

      var elementConnections = cNode.connections;

      // remove the connection from the other node to prevent duplicate connections
      var duplicateIndex = elementConnections.findIndex((connection) => {
        return connection == node.id; // double equals since id can be numeric or string
      });

      if (duplicateIndex != -1) {
        elementConnections.splice(duplicateIndex, 1);
      }
    });
  });

  return networkEdges;
}

function getNodeById(data: NodeEdge[], id: IdType) {
  for (var n = 0; n < data.length; n++) {
    if (data[n].id == id) {
      // double equals since id can be numeric or string
      return data[n];
    }
  }

  throw "Can not find id '" + id + "' in data";
}
