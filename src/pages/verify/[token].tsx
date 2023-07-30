import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { AudioRecorder } from "react-audio-voice-recorder";

const TokenPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const tokenAsString = Array.isArray(token) ? token[0] : token;
  const tokenIsString = typeof tokenAsString === "string";

  const [audioBlob, setAudioBlob] = useState<Blob>();

  const namePronunciationEntry =
    api.namePronunciationEntry.getEntryByToken.useQuery(
      { token: tokenAsString! },
      {
        enabled: tokenIsString,
      }
    );
  const namePronunciationUpdate =
    api.namePronunciationEntry.updatePronunciation.useMutation({
      onSuccess: () => {
        alert("Success!");
      },
      onError: (err) => {
        alert("Error! " + err.message);
      },
    });

  const getPresignedUrlMutation =
    api.namePronunciationEntry.getPresignedUrl.useMutation();

  useEffect(() => {
    if (namePronunciationEntry.data?.id) {
      getPresignedUrlMutation.mutate({
        id: namePronunciationEntry.data.id,
        token: tokenAsString!,
      });
    }
  }, [namePronunciationEntry.data?.id]);

  if (namePronunciationEntry.isLoading) {
    return <div>Loading...</div>;
  }

  if (namePronunciationEntry.isError) {
    return <div>Error!; {namePronunciationEntry.error.message}</div>;
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      alert("Please record your name");
      return;
    }

    if (!namePronunciationEntry.data.id) {
      alert("No name pronunciation entry id");
      return;
    }
    if (!tokenAsString) {
      alert("No token");
      return;
    }
    if (getPresignedUrlMutation.data) {
      alert(
        "get presigned url data" +
          JSON.stringify(getPresignedUrlMutation.data.url)
      );
    }

    const presignedUrl = getPresignedUrlMutation.data?.url;
    if (!presignedUrl) {
      alert("No presigned url");
      return;
    }
    const audioFile = new File(
      [audioBlob],
      `${namePronunciationEntry.data.firstName}-${namePronunciationEntry.data.lastName}.webm`
    );
    const myHeaders = new Headers({ "Content-Type": "audi/webm" });
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: myHeaders,
      body: audioFile,
    });

    if (response.status !== 200) {
      alert("Error uploading audio");
      return;
    }
    const url = presignedUrl.split("?")[0];

    if (!url) {
      alert("No url");
      return;
    }
    namePronunciationUpdate.mutate({
      id: namePronunciationEntry.data.id,
      token: tokenAsString,
      pronunciationUrl: url,
    });
  };

  return (
    <div>
      <div>
        Hiiii {namePronunciationEntry.data.firstName}{" "}
        {namePronunciationEntry.data.lastName}
      </div>
      <div>
        Say your name:
        <AudioRecorder
          onRecordingComplete={(audio) => setAudioBlob(audio)}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }}
          showVisualizer={true}
          downloadFileExtension="webm"
        />
        {audioBlob && (
          <div>
            Recorded Audio:
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <button onClick={handleSubmit}>
              This is how you pronounce my name!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenPage;
