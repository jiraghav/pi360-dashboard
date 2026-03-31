"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Step5ContractSign({
  clinic,
  updateField,
  errors
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");

  const previewPayload = useMemo(
    () => JSON.stringify({
      ...clinic,
      preview_contract_pdf: 1,
    }),
    [clinic]
  );

  const previewFrameUrl = useMemo(() => {
    if (!previewUrl) {
      return "";
    }

    return `${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  }, [previewUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111827";
    context.lineWidth = 2;

    if (!clinic.signature_data_url) return;

    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = clinic.signature_data_url;
  }, [clinic.signature_data_url]);

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}create_facility.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: previewPayload,
        });

        if (!response.ok) {
          throw new Error("Unable to load the contract preview.");
        }

        const blob = await response.blob();

        if (!isActive) return;

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl((previousUrl) => {
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }

          return objectUrl;
        });
      } catch (error) {
        if (!isActive) return;
        setPreviewError(error.message || "Unable to load the contract preview.");
      } finally {
        if (isActive) {
          setPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      clearTimeout(timer);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewPayload]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const beginDrawing = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    setIsDrawing(false);
    updateField("signature_data_url", canvas.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    updateField("signature_data_url", "");
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">
        Step 5: Contract Sign
      </h2>

      <div className="rounded-lg border border-gray-700 bg-gray-950/70 p-4 text-sm text-gray-300">
        Review the populated contract below. The preview is generated from the onboarding data already entered, and your signature will be added to the saved PDF when you submit.
      </div>

      <div className="rounded-xl border border-gray-700 overflow-hidden bg-white">
        {previewLoading ? (
          <div className="flex h-[70vh] items-center justify-center p-6 text-black">
            Loading contract preview...
          </div>
        ) : previewError ? (
          <div className="flex h-[70vh] items-center justify-center p-6 text-center text-red-700">
            {previewError}
          </div>
        ) : (
          <iframe
            src={previewFrameUrl}
            title="Contract Preview"
            className="h-[70vh] w-full"
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">
            Signature
          </h3>
          <button
            type="button"
            onClick={clearSignature}
            className="rounded border border-gray-600 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
          >
            Clear
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={900}
          height={240}
          className={`w-full rounded-xl border bg-white touch-none ${errors?.signature_data_url ? "border-red-500" : "border-gray-600"}`}
          onMouseDown={beginDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={beginDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />

        <p className="text-xs text-gray-400">
          Sign with your mouse or finger. Your signature will be added to the final contract when you submit.
        </p>

        {errors?.signature_data_url && (
          <p className="text-sm text-red-400">{errors.signature_data_url}</p>
        )}
      </div>
    </div>
  );
}
