import { NextResponse } from "next/server";
import { getAllLists } from "@/lib/lists";

export async function GET() {
  const lists = await getAllLists();
  return NextResponse.json({ count: lists.length });
}

