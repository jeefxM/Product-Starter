"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Calendar,
  DollarSign,
  Target,
  Users,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLaunchCampaign } from "@/hooks/use-launch-campaign";
import { useAccount } from "wagmi";
import { useEdgeStore } from "@/lib/edgestore";
import Image from "next/image";

export function CreateCampaignForm() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    category: "",
    fundingGoal: "",
    maxSupply: "",
    duration: "",
    startingPrice: "",
    priceIncrement: "",
    paymentToken: "PYUSD",
  });
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { launchCampaign, isPending, isConfirming, isConfirmed, hash, error } =
    useLaunchCampaign();
  const { edgestore } = useEdgeStore();

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedFile) return;

    try {
      const res = await edgestore.publicFiles.upload({
        file: selectedFile,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      setImageUrl(res.url);
      toast({
        title: "Image Uploaded",
        description: "Your product image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  const removeImage = async () => {
    if (imageUrl) {
      try {
        await edgestore.publicFiles.delete({
          url: imageUrl,
        });
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    setImageUrl("");
    setFile(undefined);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to launch a product.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate presale timestamp (duration in days from now)
      const presaleTimestamp = BigInt(
        Math.floor(Date.now() / 1000) +
          parseInt(formData.duration) * 24 * 60 * 60
      );

      // Launch campaign on-chain (database save happens automatically in the hook)
      await launchCampaign({
        name: formData.name,
        symbol: formData.symbol,
        minRequiredSales: parseInt(formData.fundingGoal),
        maxItems: parseInt(formData.maxSupply),
        presaleTimestamp,
        startPrice: formData.startingPrice,
        priceIncrement: formData.priceIncrement,
        paymentToken: formData.paymentToken,
        description: formData.description,
        category: formData.category,
        creatorAddress: address,
        imageUrl: imageUrl,
      });

      toast({
        title: "Transaction Submitted!",
        description:
          "Your product campaign is being created on-chain. Please wait for confirmation.",
      });
    } catch (error) {
      console.error("Error launching campaign:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to launch product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Campaign Created!",
        description:
          "Your product campaign has been successfully launched and saved.",
      });

      // Reset form
      setFormData({
        name: "",
        symbol: "",
        description: "",
        category: "",
        fundingGoal: "",
        maxSupply: "",
        duration: "",
        startingPrice: "",
        priceIncrement: "",
        paymentToken: "PYUSD",
      });

      // Reset image upload
      setImageUrl("");
      setFile(undefined);
      setUploadProgress(0);

      setLoading(false);
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [error, toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Please connect your wallet to launch a product campaign.
          </p>
        </div>
      )}
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Product Information
          </CardTitle>
          <CardDescription>Tell supporters about your product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Innovative Product Idea"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">NFT Symbol</Label>
              <Input
                id="symbol"
                placeholder="ESWB"
                value={formData.symbol}
                onChange={(e) => updateFormData("symbol", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your innovative product and why people should support it..."
              rows={4}
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateFormData("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project Image</Label>
            {!imageUrl ? (
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    <>
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-muted-foreground/25 rounded-lg p-4">
                <div className="relative w-full h-48 mb-2">
                  <Image
                    src={imageUrl}
                    alt="Uploaded image"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Funding Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Funding Details
          </CardTitle>
          <CardDescription>Set your funding goals and pricing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundingGoal">Minimum Supporters Required</Label>
              <Input
                id="fundingGoal"
                type="number"
                placeholder="100"
                value={formData.fundingGoal}
                onChange={(e) => updateFormData("fundingGoal", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSupply">Maximum Items (NFT Supply)</Label>
              <Input
                id="maxSupply"
                type="number"
                placeholder="1000"
                value={formData.maxSupply}
                onChange={(e) => updateFormData("maxSupply", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingPrice">Starting Price</Label>
              <Input
                id="startingPrice"
                type="number"
                step="0.001"
                placeholder="10"
                value={formData.startingPrice}
                onChange={(e) =>
                  updateFormData("startingPrice", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceIncrement">Price Increment</Label>
              <Input
                id="priceIncrement"
                type="number"
                step="0.001"
                placeholder="1"
                value={formData.priceIncrement}
                onChange={(e) =>
                  updateFormData("priceIncrement", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentToken">Payment Token</Label>
            <Select
              value={formData.paymentToken}
              onValueChange={(value) => updateFormData("paymentToken", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PYUSD">PYUSD (Sepolia)</SelectItem>
                <SelectItem value="ETH">ETH (Sepolia)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Timeline
          </CardTitle>
          <CardDescription>Set your campaign duration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="duration">Campaign Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="30"
              value={formData.duration}
              onChange={(e) => updateFormData("duration", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full btn-gradient"
        size="lg"
        disabled={loading || isPending || isConfirming || !isConnected}
      >
        {loading || isPending || isConfirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConfirming
              ? "Confirming Transaction..."
              : "Launching Product..."}
          </>
        ) : (
          "Launch Product"
        )}
      </Button>
    </form>
  );
}
