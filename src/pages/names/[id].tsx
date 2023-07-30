import type { GetStaticProps, GetStaticPaths, NextPage } from "next";
import { prisma } from "~/server/db";
import { NamePronunciationEntry } from "@prisma/client";

interface NamePageProps {
  entry: NamePronunciationEntry;
}

export const NamePage: NextPage<NamePageProps> = ({ entry }) => {
  return (
    <div>
      <div>
        {entry.firstName} - {entry.lastName}
      </div>
      <div>
        Spreek je zo uit:
        <audio controls src={entry.pronunciationUrl!}></audio>
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const getAllValidatedEntries = await prisma.namePronunciationEntry.findMany({
    where: {
      validated: true,
      pronunciationUrl: {
        not: null,
      },
    },
  });

  const paths = getAllValidatedEntries.map((entry) => ({
    params: {
      id: entry.id,
    },
  }));
  return {
    paths: paths,
    fallback: true, // false or "blocking"
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params!.id;

  const entry = await prisma.namePronunciationEntry.findUniqueOrThrow({
    where: {
      id: id as string,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pronunciationUrl: true,
    },
  });

  return {
    props: {
      entry: entry,
    },
  };
};

export default NamePage;
