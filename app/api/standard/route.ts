import { NextResponse } from "next/server";
import { Standard } from "@/models/questionsSchema";
import { connectDb } from "@/utils/db"
import { Chapter } from "@/models/questionsSchema";
import { Exercise } from "@/models/questionsSchema";
import { Question } from "@/models/questionsSchema";
/**
 * @swagger
 * /api/standard:
 *   get:
 *     summary: Retrieve all classes
 *     description: Fetches a list of all classes (standards) along with their details such as standard name and description.
 *     tags:
 *       - Standards
 *     responses:
 *       200:
 *         description: Successfully retrieved all classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "676f580403831da26a228fb6"
 *                       standardName:
 *                         type: integer
 *                         example: 2
 *                       description:
 *                         type: string
 *                         example: "Grade 2 - Advanced concepts"
 *       400:
 *         description: Failed to retrieve classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve the Classes Information"
 * 
 *   post:
 *     summary: Create a new standard
 *     description: Adds a new standard (class) with its name and description.
 *     tags:
 *       - Standards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               standardName:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "This is the standard for students in grade 10."
 *     responses:
 *       201:
 *         description: Successfully created the standard.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Standard created successfully"
 *                 standard:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "6772a873bc41879fdd60748d"
 *                     standardName:
 *                       type: integer
 *                       example: 10
 *                     description:
 *                       type: string
 *                       example: "This is the standard for students in grade 10."
 *       400:
 *         description: Missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Standard name is required"
 *       500:
 *         description: Failed to create the standard.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to create standard"
 * 
 *   delete:
 *     summary: Delete a standard and related data
 *     description: Deletes a specific standard by ID and removes all related chapters, exercises, and questions.
 *     tags:
 *       - Standards
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the standard to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the standard and related data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Standard and related data deleted successfully"
 *       404:
 *         description: Standard not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Id not Found"
 *       500:
 *         description: Failed to delete the standard and related data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete standard and related data"
 */


export async function GET() {
  try {
    await connectDb();
    console.log("hello");
    const classes = await Standard.find();
    return NextResponse.json({ classes }, { status: 200 })
  } catch (error) {
    console.error("Error in handling GET req standard :", error);

    return NextResponse.json({ error: "Failed to retrive the Classes Information" }, { status: 400 });
  }
}


export async function POST(req: Request) {
  try {
    await connectDb();
    const { standardName, description } = await req.json();

    if (!standardName) {
      return NextResponse.json({ error: "Standard name is required" }, { status: 400 });
    }
    const newStandard = new Standard({ standardName, description, });
    const savedStandard = await newStandard.save();

    return NextResponse.json({ message: "Standard created successfully", standard: savedStandard }, { status: 201 });
  } catch (error) {
    console.log("Error creating standard :", error);
    return NextResponse.json({ error: "Failed to create standard" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    // Connect to the database
    await connectDb();

    const { searchParams } = new URL(req.url);
    const standardId = searchParams.get("id");

    if (!standardId) {
      return NextResponse.json({ error: "Id not Found" }, { status: 404 });
    }


    const chaptersToDelete = await Chapter.find({ standard: standardId });
    const chapterIds = chaptersToDelete.map(chapter => chapter._id);

    const exercisesToDelete = await Exercise.find({ chapter: { $in: chapterIds } });
    const exerciseIds = exercisesToDelete.map(exercise => exercise._id);

    await Question.deleteMany({ exercise: { $in: exerciseIds } });

    await Exercise.deleteMany({ _id: { $in: exerciseIds } });

    await Chapter.deleteMany({ _id: { $in: chapterIds } });

    const deletedStandard = await Standard.findByIdAndDelete(standardId);

    if (!deletedStandard) {
      return NextResponse.json({ error: "Standard not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Standard and related data deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting standard and related data:", error);
    return NextResponse.json({ error: "Failed to delete standard and related data" }, { status: 500 });
  }
}

