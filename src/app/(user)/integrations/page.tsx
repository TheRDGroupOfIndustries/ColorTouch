"use client";
import React, { useEffect, useState } from "react";
import { Eye, Key } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";

export default function Integrations() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [provider, setProvider] = useState("whatsapp-business-api");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        token: apiKey,
        secret: apiSecret,
        provider: provider,
        phoneNumber: phoneNumber
      }),
        credentials: "same-origin",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error saving API key:", data.error);
      toast.error(data.error || "Failed to save API key.");
      return;
    }

    toast.success("API key saved successfully!");
    console.log("Saved key response:", data);
    setApiKey("");
    setApiSecret("");
    setPhoneNumber("");
  } catch (error) {
    console.error("Error submitting API key:", error);
    toast.error("Something went wrong while saving the API key.");
  }
};

useEffect(() => {
    const fetchBanners = async () => {
      try {
        // include credentials so next-auth cookie is sent when fetching tokens
        const res = await axios.get("/api/token", { withCredentials: true });
        if (res.status === 401) {
          toast.error("Please sign in to view integrations");
          return;
        }
        console.log(res.data);
      } catch (err: any) {
        console.error("Error fetching banners:", err);
        const status = err?.response?.status;
        if (status === 401) {
          toast.error("Please sign in to view integrations");
        } else {
          toast.error("Failed to fetch integration tokens");
        }
      }
    };
    fetchBanners();
  }, []);

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-row items-center justify-between p-6 pb-0">
        <div className="h-full w-full">
          <div className="font-semibold text-2xl">Integration</div>
          <div className="text-base text-muted-foreground">
            Manage your third-party integrations and API connections.
          </div>
        </div>
      </div>

      {/* main */}

      <div className="px-0 py-6">
        <div className="@container/main flex h-[calc(100vh-11rem)] flex-1 flex-col gap-4 overflow-scroll px-4">
          <div className="w-full space-y-6">
            <div className="text-card-foreground bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
              {/* Header */}
              <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 border-b pb-6">
                <div className="flex items-center gap-2 font-semibold leading-none">
                  <Key className="h-5 w-5" />
                  WhatsApp Integration
                </div>
              </div>

              {/* Content */}
              <div className="px-6">
                <div className="space-y-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="inline-flex items-center rounded-md border bg-card px-2 py-0.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground">
                      WhatsApp Business API
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Connect your WhatsApp Business API to send campaigns
                    </span>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 overflow-hidden"
                  >
                    {/* API Key */}
                    <div className="grid gap-2">
                      <label className="flex flex-row gap-1 text-sm font-medium leading-none">
                        <span>{provider === 'twilio' ? 'Account SID' : 'API Key'}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-[11px] w-[11px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M12 6v12" />
                          <path d="M17.196 9 6.804 15" />
                          <path d="m6.804 9 10.392 6" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'twilio' ? 'Enter your Twilio Account SID' : 'Enter your WhatsApp API Key'}
                        className="border-input  placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm"
                        required
                      />
                    </div>

                    {/* API Secret */}
                    <div className="grid gap-2">
                      <label className="text-sm font-medium leading-none">
                        {provider === 'twilio' ? 'Auth Token' : 'API Secret (Optional)'}
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? "text" : "password"}
                          name="apiSecret"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder={provider === 'twilio' ? 'Enter your Twilio Auth Token' : 'Enter your WhatsApp API Secret'}
                          className="border-input  placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm"
                          required={provider === 'twilio'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center rounded-e-md border text-muted-foreground/80 hover:text-foreground transition"
                          aria-label="Toggle password visibility"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Phone Number (Twilio Only) */}
                    {provider === 'twilio' && (
                      <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none">
                          WhatsApp Sandbox Number (Optional)
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+14155238886 (default sandbox)"
                          className="border-input placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to use Twilio's default sandbox: +14155238886
                        </p>
                      </div>
                    )}

                    {/* Provider */}
                    <div className="grid gap-2">
                      <label className="text-sm font-medium leading-none">
                        Provider
                      </label>
                      <select
                        name="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="border-input bg-black text-sm flex h-10 w-full items-center justify-between rounded-md border px-3 py-2"
                      >
                        <option value="whatsapp-business-api">
                          WhatsApp Business API
                        </option>
                        <option value="twilio">Twilio</option>
                        <option value="360dialog">360Dialog</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 ">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-[#f4f1f1] px-4 py-2 text-sm font-medium text-black hover:bg-[#cbc6c6]/90 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 transition-all cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
