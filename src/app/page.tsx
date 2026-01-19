import { LandingPage } from "@/modules/pages/components/landing-page";
import PageRenderer from "@/modules/pages/components/page-renderer";
import { getDb } from "@/db";
import { pages } from "@/modules/pages/schemas/page.schema";
import { eq } from "drizzle-orm";

export default async function Page() {
    const db = await getDb();
    const existingPage = await db.query.pages.findFirst({
        where: eq(pages.slug, "home"),
    });

    console.log("DEBUG: Existing Page:", existingPage);

    if (existingPage && existingPage.isPublished) {
         return <PageRenderer page={existingPage} />;
    }

    return <LandingPage />;
}
