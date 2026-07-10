import fs from "fs/promises";
import path from "path";

export const processReport = async (payload) => {

    console.log();
    console.log("Report Processor Started");

    if (!payload.reportName || !payload.content) {
        throw new Error("Invalid report payload");
    }

    const reportsFolder = path.join(process.cwd(), "reports");

    await fs.mkdir(reportsFolder, {
        recursive: true
    });

    const fileName = `${Date.now()}.txt`;

    const filePath = path.join(reportsFolder, fileName);

    const reportContent = `Report Name : ${payload.reportName}

Generated At : ${new Date().toLocaleString()}

----------------------------------------

${payload.content}
`;

    await fs.writeFile(filePath, reportContent);

    console.log(`Report Saved: ${fileName}`);

    console.log("✅ Report Generated Successfully");
};