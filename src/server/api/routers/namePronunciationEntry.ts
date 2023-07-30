import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPresignedUrl } from "~/utils/getPresignedUrl";
import { sendMail } from "~/emails/send-mail";

export const namePronunciationEntryRouter = createTRPCRouter({
  requestEntry: publicProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // generate random token of length 12
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const createdEntry = await ctx.prisma.namePronunciationEntry.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          token: token,
        },
      });
      sendMail(input.email, token);
      return {
        firstName: createdEntry.firstName,
        lastName: createdEntry.lastName,
        email: createdEntry.email,
      };
    }),
  getEntryByToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const entry = await ctx.prisma.namePronunciationEntry.findUnique({
        where: {
          token: input.token,
          validated: false,
        },
      });

      if (!entry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      }
      return {
        id: entry.id,
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
      };
    }),
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.namePronunciationEntry.findUnique({
        where: {
          token: input.token,
          id: input.id,
          validated: false,
        },
      });

      if (!entry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Entry not found",
        });
      }
      const url = await getPresignedUrl(entry.id);
      return {
        url,
        id: entry.id,
      };
    }),
  updatePronunciation: publicProcedure
    .input(
      z.object({
        token: z.string(),
        id: z.string(),
        pronunciationUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedNameEntry = await ctx.prisma.namePronunciationEntry.update({
        where: {
          token: input.token,
          id: input.id,
          validated: false,
        },
        data: {
          validated: true,
          pronunciationUrl: input.pronunciationUrl,
        },
      });
      return updatedNameEntry;
    }),
  getAllValidatedEntries: publicProcedure.query(async ({ ctx }) => {
    const validatedEntries = await ctx.prisma.namePronunciationEntry.findMany({
      where: {
        validated: true,
      },
    });
    return validatedEntries;
  }),
});
