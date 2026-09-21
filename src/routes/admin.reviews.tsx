import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { MediaInput } from "@/components/admin/MediaInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Review } from "@/lib/types";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

type ReviewDraft = {
  id?: string;
  product_id: string;
  reviewer_name: string;
  profile_image_url: string | null;
  product_image_url: string | null;
  rating: string;
  comment: string;
  is_approved: boolean;
};

type ProductOption = { id: string; name: string };

const emptyDraft: ReviewDraft = {
  product_id: "",
  reviewer_name: "",
  profile_image_url: null,
  product_image_url: null,
  rating: "5",
  comment: "",
  is_approved: true,
};

function AdminReviewsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ReviewDraft | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id,product_id,reviewer_name,profile_image_url,product_image_url,rating,comment,is_approved,created_at,products(name)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Review[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "review-products"],
    queryFn: async (): Promise<ProductOption[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name")
        .eq("is_published", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as ProductOption[];
    },
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    void qc.invalidateQueries({ queryKey: ["homepage-reviews"] });
  };

  const save = useMutation({
    mutationFn: async (item: ReviewDraft) => {
      if (!item.product_id || !item.reviewer_name.trim()) {
        throw new Error("পণ্য এবং রিভিউদাতার নাম দিতে হবে");
      }
      const rating = Math.min(5, Math.max(1, Number(item.rating) || 5));
      const payload = {
        product_id: item.product_id,
        reviewer_name: item.reviewer_name.trim(),
        profile_image_url: item.profile_image_url,
        product_image_url: item.product_image_url,
        rating,
        comment: item.comment.trim() || null,
        is_approved: item.is_approved,
      };
      if (item.id) {
        const { error } = await supabase.from("reviews").update(payload).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({ ...payload, is_approved: false })
        .select("id")
        .single();
      if (error) throw error;

      if (item.is_approved) {
        const { error: approvalError } = await supabase
          .from("reviews")
          .update({ is_approved: true })
          .eq("id", data.id);
        if (approvalError) throw approvalError;
      }
    },
    onSuccess: () => {
      toast.success("রিভিউ সংরক্ষণ হয়েছে");
      setDraft(null);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "রিভিউ সংরক্ষণ করা যায়নি"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
      refresh();
    },
    onError: () => toast.error("রিভিউ মুছে ফেলা যায়নি"),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: () => toast.error("রিভিউর অবস্থা পরিবর্তন করা যায়নি"),
  });

  const productName = (review: Review) => review.products?.name || products.find((p) => p.id === review.product_id)?.name || "অজানা পণ্য";

  return (
    <div>
      <AdminHeading
        title="রিভিউ ব্যবস্থাপনা"
        description="গ্রাহকের রিভিউ যোগ, সম্পাদনা, অনুমোদন ও মুছে ফেলুন"
        action={
          <Button onClick={() => setDraft({ ...emptyDraft, product_id: products[0]?.id ?? "" })}>
            <Plus className="size-4" /> নতুন রিভিউ
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>রিভিউদাতা</TableHead>
              <TableHead>পণ্য</TableHead>
              <TableHead>রেটিং</TableHead>
              <TableHead>মন্তব্য</TableHead>
              <TableHead>অবস্থা</TableHead>
              <TableHead className="text-right">কাজ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && !reviews.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  এখনও কোনো রিভিউ নেই
                </TableCell>
              </TableRow>
            )}
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.reviewer_name}</TableCell>
                <TableCell>{productName(review)}</TableCell>
                <TableCell>{"★".repeat(review.rating)}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {review.comment || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={review.is_approved}
                      onCheckedChange={(value) => toggle.mutate({ id: review.id, value })}
                    />
                    <Badge variant={review.is_approved ? "default" : "secondary"}>
                      {review.is_approved ? "অনুমোদিত" : "অপেক্ষমাণ"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" aria-label="সম্পাদনা" onClick={() => setDraft({
                      id: review.id,
                      product_id: review.product_id,
                      reviewer_name: review.reviewer_name,
                      profile_image_url: review.profile_image_url,
                      product_image_url: review.product_image_url,
                      rating: String(review.rating),
                      comment: review.comment || "",
                      is_approved: review.is_approved,
                    })}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="মুছে ফেলুন"
                      onClick={() => remove.mutate(review.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "রিভিউ সম্পাদনা" : "নতুন রিভিউ"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>পণ্য</Label>
                <Select value={draft.product_id} onValueChange={(value) => setDraft({ ...draft, product_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="পণ্য নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-1.5">
                  <Label>রিভিউদাতার নাম</Label>
                  <Input value={draft.reviewer_name} onChange={(e) => setDraft({ ...draft, reviewer_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>রেটিং (১-৫)</Label>
                  <Input type="number" min="1" max="5" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>মন্তব্য</Label>
                <Textarea rows={4} value={draft.comment} onChange={(e) => setDraft({ ...draft, comment: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaInput
                  label="প্রোফাইল ছবি"
                  hint="রিভিউদাতার ছবি (স্কয়ার)"
                  folder="store"
                  value={draft.profile_image_url}
                  onChange={(url) => setDraft({ ...draft, profile_image_url: url })}
                />
                <MediaInput
                  label="পণ্যের ছবি"
                  hint="ছবির অনুপাত ৪:৫"
                  folder="store"
                  ratio="portrait"
                  value={draft.product_image_url}
                  onChange={(url) => setDraft({ ...draft, product_image_url: url })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_approved} onCheckedChange={(value) => setDraft({ ...draft, is_approved: value })} />
                <Label className="font-normal">হোমপেজে দেখাও</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>বাতিল</Button>
            <Button disabled={save.isPending} onClick={() => draft && save.mutate(draft)}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
