import { getReportData } from "./data";

export type ListInfo = {
  id: string;
  title: string;
  description?: string;
  reportId: string;
  sectionId: string;
  reportTitle?: string;
  createdAt?: string;
};

export const getAllLists = async (): Promise<ListInfo[]> => {
  const { reports } = await getReportData();
  const lists: ListInfo[] = [];

  reports.forEach((report) => {
    report.sections.forEach((section) => {
      // Extract List number from title (e.g., "List 1", "List 2", etc.)
      const listMatch = section.title.match(/list\s*(\d+)/i);
      if (listMatch) {
        lists.push({
          id: section.id,
          title: section.title,
          description: section.description,
          reportId: report.id,
          sectionId: section.id,
          reportTitle: report.title,
          createdAt: report.createdAt,
        });
      }
    });
  });

  return lists.sort((a, b) => {
    const aNum = parseInt(a.title.match(/list\s*(\d+)/i)?.[1] || "0");
    const bNum = parseInt(b.title.match(/list\s*(\d+)/i)?.[1] || "0");
    return aNum - bNum;
  });
};

export const getListById = async (listId: string): Promise<ListInfo | undefined> => {
  const lists = await getAllLists();
  return lists.find((list) => list.id === listId);
};

export const getListByNumber = async (number: number): Promise<ListInfo | undefined> => {
  const lists = await getAllLists();
  return lists.find((list) => {
    const match = list.title.match(/list\s*(\d+)/i);
    return match && parseInt(match[1]) === number;
  });
};

