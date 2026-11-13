import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function usePlayback(source: Uint8Array | null) {
  const midi = useMemo(
    () => (source === null ? null : new Midi(source)),
    [source],
  );
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const synth = useRef<Tone.PolySynth | null>(null);
  const duration = midi?.duration ?? 0;

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();

    return () => {
      synth.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const transport = Tone.getTransport();

    transport.stop();
    transport.seconds = 0;
    synth.current?.releaseAll();

    if (!midi) {
      return;
    }

    const notes = midi.tracks.flatMap((track) => track.notes);

    const part = new Tone.Part((time, note) => {
      synth.current?.triggerAttackRelease(
        note.name,
        note.duration,
        time,
        note.velocity,
      );
    }, notes);

    part.start(0); // schedule playback

    return () => {
      part.dispose();
    };
  }, [midi]);

  useEffect(() => {
    const transport = Tone.getTransport();

    transport
      .on("start", () => setPlaying(true))
      .on("pause", () => setPlaying(false))
      .on("stop", () => {
        setPlaying(false);
        setPosition(0);
      });

    return () => {
      transport.off("start").off("pause").off("stop");
    };
  }, []);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const transport = Tone.getTransport();

    const interval = window.setInterval(() => {
      if (duration > 0 && transport.seconds >= duration) {
        transport.stop();
        transport.seconds = 0;
        setPosition(0);
        return;
      }

      setPosition(transport.seconds);
    }, 100);

    return () => window.clearInterval(interval);
  }, [playing, duration]);

  useEffect(() => {
    return () => {
      Tone.getTransport().stop();
    };
  }, []);

  const toggle = useCallback(async () => {
    const transport = Tone.getTransport();

    if (transport.state === "started") {
      transport.pause();
      synth.current?.releaseAll();
      return;
    }

    await Tone.start();

    if (duration > 0 && transport.seconds >= duration) {
      transport.seconds = 0;
    }

    transport.start();
  }, [duration]);

  const seek = useCallback(
    (seconds: number) => {
      const transport = Tone.getTransport();
      const next = Math.min(seconds, duration);

      transport.seconds = next;
      setPosition(next);
      synth.current?.releaseAll();
    },
    [duration],
  );

  return { playing, position, duration, toggle, seek };
}

export { usePlayback };
