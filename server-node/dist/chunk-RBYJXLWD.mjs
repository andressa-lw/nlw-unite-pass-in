import {
  BadRequest
} from "./chunk-J3JDHXVX.mjs";
import {
  prisma
} from "./chunk-JV6GRE7Y.mjs";

// src/routes/get-attendee-badge.ts
import { z } from "zod";
async function getAttendeeBadge(app) {
  app.withTypeProvider().get("/attendees/:attendeeId/badge", {
    schema: {
      summary: "Get an attendee badge",
      tags: ["attendees"],
      params: z.object({
        attendeeId: z.coerce.number().int()
      }),
      response: {
        200: z.object({
          badge: z.object({
            name: z.string(),
            email: z.string().email(),
            eventTtitle: z.string(),
            checkInURL: z.string().url()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendee = await prisma.attendee.findUnique({
      select: {
        name: true,
        email: true,
        event: {
          select: {
            title: true
          }
        }
      },
      where: {
        id: attendeeId
      }
    });
    if (attendee === null) {
      throw new BadRequest("Attendee not found.");
    }
    const baseURL = `${request.protocol}://${request.hostname}`;
    const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);
    return reply.send({
      badge: {
        name: attendee.name,
        email: attendee.email,
        eventTtitle: attendee.event.title,
        checkInURL: checkInURL.toString()
      }
    });
  });
}

export {
  getAttendeeBadge
};
