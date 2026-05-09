import {Request, Response} from "express";

// Simulated Peer IO$ Transfer endpoint
export default async function peerIOTransfer(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }
  const {fromNode, toNode, amount} = req.body;
  if (!fromNode || !toNode || !amount || amount <= 0) {
    return res.status(400).json({error: "Invalid transfer data"});
  }
  // Here you would add logic to update balances, log the transfer, etc.
  // For demo, just return success
  return res.status(200).json({
    message: `Transferred ${amount} IO$ from ${fromNode} to ${toNode}.`,
    fromNode,
    toNode,
    amount,
  });
}
