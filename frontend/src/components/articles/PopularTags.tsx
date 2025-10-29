import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PopularTagsProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export function PopularTags({ tags, selectedTag, onTagSelect }: PopularTagsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 12).map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => onTagSelect(selectedTag === tag ? "" : tag)}
              className="text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
