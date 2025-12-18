interface ContentDisplayProps {
  content: any;
  contentType: string;
  topic: string;
}

const ContentDisplay = ({ content, contentType, topic }: ContentDisplayProps) => {
  const renderNotes = () => {
    const text = content.text || content;
    const lines = text.split('\n').filter((line: string) => line.trim());
    const heading = lines[0] || topic;
    const subheading = lines[1] || 'Generated content ready for download';
    
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-primary">{heading}</h2>
        <p className="text-lg text-muted-foreground">{subheading}</p>
        <p className="text-sm text-muted-foreground italic">
          Content generated successfully. Use the download buttons above to get the full formatted document.
        </p>
      </div>
    );
  };

  const renderQuiz = () => (
    <div className="space-y-6">
      {content.questions?.map((q: any, idx: number) => (
        <div key={idx} className="p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-3">
            {idx + 1}. {q.question}
          </h3>
          <div className="space-y-2">
            {q.options?.map((option: string, optIdx: number) => (
              <div
                key={optIdx}
                className={`p-2 rounded border ${
                  optIdx === q.correctAnswer
                    ? "bg-accent/10 border-accent"
                    : "bg-card border-border"
                }`}
              >
                {String.fromCharCode(65 + optIdx)}. {option}
              </div>
            ))}
          </div>
          {q.explanation && (
            <p className="mt-3 text-sm text-muted-foreground italic">
              💡 {q.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const renderMindMap = () => (
    <div className="space-y-4">
      <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <h2 className="text-2xl font-bold text-primary">{content.central || "Main Topic"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {content.branches?.map((branch: any, idx: number) => (
          <div key={idx} className="p-4 rounded-lg bg-card border-2 border-border">
            <h3 className="font-semibold text-lg mb-2 text-secondary">{branch.title}</h3>
            <ul className="space-y-1 ml-4">
              {branch.items?.map((item: string, itemIdx: number) => (
                <li key={itemIdx} className="text-sm text-muted-foreground list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHandout = () => {
    const text = content.text || content;
    const lines = text.split('\n').filter((line: string) => line.trim());
    const heading = lines[0] || topic;
    const subheading = lines[1] || 'Generated handout ready for download';
    
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-primary">{heading}</h2>
        <p className="text-lg text-muted-foreground">{subheading}</p>
        <p className="text-sm text-muted-foreground italic">
          Handout generated successfully. Use the download buttons above to get the full formatted document.
        </p>
      </div>
    );
  };

  const renderDefault = () => (
    <div className="whitespace-pre-wrap text-sm">{JSON.stringify(content, null, 2)}</div>
  );

  const renderContent = () => {
    switch (contentType) {
      case "notes":
        return renderNotes();
      case "quiz":
        return renderQuiz();
      case "mindmap":
        return renderMindMap();
      case "handout":
        return renderHandout();
      default:
        return renderDefault();
    }
  };

  return <div className="max-h-[600px] overflow-y-auto">{renderContent()}</div>;
};

export default ContentDisplay;