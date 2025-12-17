"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Upload, X, FileText, Image as ImageIcon, Video } from "lucide-react";

const WhatsAppCampaignPage = () => {
  const [form, setForm] = useState({
    campaignName: "",
    description: "",
    campaignType: "MARKETING",
    priority: "HIGH",
    messageType: "TEXT",
    messageContent: "",
    mediaURL: "",
    templateID: "",
  });

  const [uploadedFile, setUploadedFile] = useState<{
    file: File;
    preview?: string;
    type: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime"];
    const validDocTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    
    const allValidTypes = [...validImageTypes, ...validVideoTypes, ...validDocTypes];
    
    if (!allValidTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image, video, or document.");
      return;
    }

    // Validate file size (16MB max for WhatsApp)
    if (file.size > 16 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 16MB");
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (validImageTypes.includes(file.type)) {
      preview = URL.createObjectURL(file);
    }

    setUploadedFile({
      file,
      preview,
      type: validImageTypes.includes(file.type) ? "image" : validVideoTypes.includes(file.type) ? "video" : "document"
    });
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setForm(prev => ({ ...prev, mediaURL: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.campaignName.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    
    if (!form.messageContent.trim()) {
      toast.error("Message content is required");
      return;
    }

    let mediaURL = form.mediaURL;

    // Upload file if one was selected
    if (uploadedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile.file);

        const uploadRes = await fetch("/api/campaigns/upload-media", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          toast.error(error.error || "Failed to upload media file");
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        mediaURL = uploadData.url;
        toast.success(`File uploaded: ${uploadData.fileName}`);
      } catch (error) {
        toast.error("Failed to upload media file");
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mediaURL }),
      });
      
      if (!res.ok) {
        toast.error("Failed to create campaign");
        return;
      }

      const data = await res.json();

      toast.success("✅ Campaign created successfully!");
      console.log("✅ Created Campaign:", data);
      
      // Reset form after successful creation
      setForm({
        campaignName: "",
        description: "",
        campaignType: "MARKETING",
        priority: "HIGH",
        messageType: "TEXT",
        messageContent: "",
        mediaURL: "",
        templateID: "",
      });
      removeFile();
    } catch (error: any) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">WhatsApp Campaigns</h1>
        <p className="text-gray-400">
          Manage your WhatsApp campaigns and create new campaigns for your
          audience.
        </p>
      </div>

      {/* Form */}
      <div className="p-8 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold">Create WhatsApp Campaign</h2>
        <p className="">Fill out the details below to create a new campaign.</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campaign Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="campaignName"
              value={form.campaignName}
              onChange={handleChange}
              placeholder="Enter campaign name"
              required
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter campaign description"
              rows={6}
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
            />
          </div>

          {/* Campaign Type & Priority */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">
                Campaign Type <span className="text-red-500">*</span>
              </label>
              <select
                name="campaignType"
                value={form.campaignType}
                onChange={handleChange}
                required
                className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              >
                <option value="MARKETING">MARKETING</option>
                <option value="PROMOTIONAL">PROMOTIONAL</option>
                <option value="REMINDER">REMINDER</option>
                <option value="NOTIFICATION">NOTIFICATION</option>
                <option value="TRANSACTIONAL">TRANSACTIONAL</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
                className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          {/* Message Type & Content */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">
              Message Type <span className="text-red-500">*</span>
            </label>
            <select
              name="messageType"
              value={form.messageType}
              onChange={handleChange}
              required
              className="p-3 rounded-lg bg-black border focus:outline-none focus:ring-2 focus:ring-primary/80 transition mb-2"
            >
              <option value="TEXT">TEXT</option>
              <option value="IMAGE">IMAGE</option>
              <option value="AUDIO">AUDIO</option>
              <option value="VIDEO">VIDEO</option>
              <option value="DOCUMENT">DOCUMENT</option>
              <option value="TEMPLATE">TEMPLATE</option>
            </select>

            <label className="mb-1 font-medium">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="messageContent"
              value={form.messageContent}
              onChange={handleChange}
              placeholder="Enter your message"
              rows={4}
              required
              className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
            />
          </div>

          {/* Media Attachment Section */}
          <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/30 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Media Attachment (Optional)
            </h3>
            <p className="text-sm text-gray-400">
              Upload an image, video, or document to attach to your campaign message
            </p>

            {!uploadedFile ? (
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-primary/50 transition text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-sm font-medium mb-1">Click to upload media</p>
                  <p className="text-xs text-gray-500">
                    Images, Videos (max 16MB) or Documents (PDF, DOC, TXT)
                  </p>
                </div>
              </label>
            ) : (
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {uploadedFile.type === "image" && uploadedFile.preview && (
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                        <img 
                          src={uploadedFile.preview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {uploadedFile.type === "video" && (
                      <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Video className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                    {uploadedFile.type === "document" && (
                      <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-green-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB · {uploadedFile.type}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Media URL & Template ID */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Media URL (Alternative)</label>
              <input
                type="text"
                name="mediaURL"
                value={form.mediaURL}
                onChange={handleChange}
                placeholder="Optional media URL"
                className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="mb-1 font-medium">Template ID</label>
              <input
                type="text"
                name="templateID"
                value={form.templateID}
                onChange={handleChange}
                placeholder="Optional template ID"
                className="p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/80 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="bg-primary bg-white text-black px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppCampaignPage;