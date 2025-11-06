"use client";

import React, { useState, useRef, useActionState, useMemo, useEffect } from "react";
import { handleGenerateConceptMap } from "@/lib/actions";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Line,
  Label as RechartsLabel,
} from 'recharts';

type Node = { id: string; label: string; x?: number; y?: number };
type Edge = { from: string; to: string; label: string };

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-lg">
        <p className="font-bold">{data.label}</p>
      </div>
    );
  }
  return null;
};


export default function ConceptMapPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [state, formAction, isGenerating] = useActionState(handleGenerateConceptMap, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (state?.status === 'error') {
      toast({
        variant: "destructive",
        title: "Concept Map Generation Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleFormSubmit = (formData: FormData) => {
    if (!pdfFile) return;
    formData.append("pdf", pdfFile);
    formAction(formData);
  };
  
  const graphData = useMemo(() => {
    if (state?.status !== 'success' || !state.conceptMap) return null;
    
    const { nodes, edges } = state.conceptMap;
    const nodeMap = new Map<string, Node>(nodes.map(n => [n.id, { ...n }]));

    // Simple physics-based layout
    const positionedNodes = nodes.map((node, i) => ({
        ...node,
        x: Math.cos((i / nodes.length) * 2 * Math.PI) * (nodes.length > 5 ? 300 : 200) + 400,
        y: Math.sin((i / nodes.length) * 2 * Math.PI) * (nodes.length > 5 ? 200 : 150) + 250,
    }));
    
    const positionedNodeMap = new Map<string, Node>(positionedNodes.map(n => [n.id, n]));

    const graphEdges = edges.map(edge => {
        const fromNode = positionedNodeMap.get(edge.from);
        const toNode = positionedNodeMap.get(edge.to);
        return { ...edge, fromNode, toNode };
    });

    return { nodes: positionedNodes, edges: graphEdges };
  }, [state]);

  const conceptMap = state?.status === 'success' ? state.conceptMap : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
       <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Generate Concept Map</CardTitle>
          <CardDescription>Visualize the key concepts and their relationships from your document.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={handleFormSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Upload PDF</Label>
              <FileUpload onFileChange={setPdfFile} disabled={isGenerating} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating || !pdfFile} className="w-full">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : ( "Generate Concept Map" )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="lg:col-span-2">
        <AnimatePresence>
            {(isGenerating || conceptMap) && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
            >
                <Card className="h-full min-h-[500px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Share2 /> Generated Concept Map
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[450px]">
                    {isGenerating && !graphData ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : graphData ? (
                       <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <XAxis type="number" dataKey="x" hide domain={[0, 800]} />
                                <YAxis type="number" dataKey="y" hide domain={[0, 500]}/>
                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                
                                {/* Render edges */}
                                {graphData.edges.map((edge, i) => {
                                    if(!edge.fromNode || !edge.toNode) return null;
                                    return (
                                        <Line
                                            key={`edge-${i}`}
                                            type="linear"
                                            dataKey="y"
                                            data={[{x: edge.fromNode.x, y: edge.fromNode.y}, {x: edge.toNode.x, y: edge.toNode.y}]}
                                            stroke="#9ca3af"
                                            strokeWidth={1}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    );
                                })}

                                <Scatter name="Concepts" data={graphData.nodes} fill="hsl(var(--primary))">
                                  {
                                    graphData.nodes.map((node, index) => (
                                      <RechartsLabel
                                        key={`label-${index}`}
                                        value={node.label}
                                        position="top"
                                        offset={10}
                                        dataKey={`label-${index}`}
                                        content={({ x, y, value, ...rest}) => (
                                            <text x={x} y={y} dy={-10} fill="hsl(var(--foreground))" fontSize={12} textAnchor="middle">
                                                {value}
                                            </text>
                                        )}
                                      />
                                    ))
                                  }
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-full bg-muted/30 dark:bg-muted/50 rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground mt-2 max-w-md">
                                Upload a PDF and click "Generate" to see your concept map.
                            </p>
                        </div>
                    )}
                </CardContent>
                </Card>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}