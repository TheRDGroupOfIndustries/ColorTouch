// app/api/leads/route.ts
import { getLeadsController, createLeadController,  updateLeadController, deleteLeadController} from "../controller/leadController";

export async function GET(req: Request) {
  return getLeadsController(req);
}

export async function POST(req: Request) {
  return createLeadController(req);
}

export async function PATCH(req: Request){
  return updateLeadController(req);
}

export async function DELETE(req: Request){
  return deleteLeadController(req);
}

