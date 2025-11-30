"use client"

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function InspectionEditor({ type }: { type: "horse" | "trailer" }) {
  const [template, setTemplate] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("inspection_templates")
        .select("structure")
        .eq("type", type)
        .single();
      if (data) setTemplate(data.structure);
      setLoading(false);
    };
    fetchTemplate();
  }, [type]);

  const handleChange = (sectionIdx: number, field: string, value: string) => {
    const updated = [...template];
    updated[sectionIdx][field] = value;
    setTemplate(updated);
  };

  const handleItemChange = (sectionIdx: number, itemIdx: number, field: string, value: string) => {
    const updated = [...template];
    updated[sectionIdx].items[itemIdx][field] = value;
    setTemplate(updated);
  };

  const addSection = () => {
    setTemplate([...template, { title: "", items: [] }]);
  };

  const addItem = (sectionIdx: number) => {
    const updated = [...template];
    updated[sectionIdx].items.push({ label: "", category: "A" });
    setTemplate(updated);
  };

  const saveTemplate = async () => {
    const { error } = await supabase
      .from("inspection_templates")
      .update({ structure: template, updated_at: new Date().toISOString() })
      .eq("type", type);
    if (!error) alert("Template saved!");
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        template.map((section, sIdx) => (
          <Card key={sIdx}>
            <CardHeader>
              <Input
                value={section.title}
                onChange={(e) => handleChange(sIdx, "title", e.target.value)}
                placeholder="Section Title"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item: any, iIdx: number) => (
                <div key={iIdx} className="flex gap-2">
                  <Input
                    value={item.label}
                    onChange={(e) => handleItemChange(sIdx, iIdx, "label", e.target.value)}
                    placeholder="Item Label"
                  />
                  <Input
                    value={item.category}
                    onChange={(e) => handleItemChange(sIdx, iIdx, "category", e.target.value)}
                    placeholder="Category"
                    className="w-20"
                  />
                </div>
              ))}
              <Button variant="outline" onClick={() => addItem(sIdx)}>
                + Add Item
              </Button>
            </CardContent>
          </Card>
        ))
      )}
      <div className="flex gap-4">
        <Button onClick={addSection}>+ Add Section</Button>
        <Button onClick={saveTemplate}>💾 Save Template</Button>
      </div>
    </div>
  );
}
