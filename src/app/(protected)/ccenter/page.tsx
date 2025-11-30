"use client";

import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface CostCenter {
  id: string;
  cost_code: string;
  company: string;
  children?: Level3CostCenter[];
}

interface Level3CostCenter {
  id: number;
  cost_code: string;
  company: string;
  branch: string;
  sub_branch: string;
  parent_cost_code: string;
}

const LevelTreeDiagram = ({ costCenters }: { costCenters: CostCenter[] }) => {
  // EPS root position
  const epsPosition = { x: Math.max(costCenters.length * 300, 600) / 2, y: 20 };
  
  // Calculate positions for each parent
  const parentPositions = costCenters.map((_, index) => ({
    x: index * 300 + 150,
    y: 120
  }));

  // Calculate positions for all children
  const childrenData = costCenters.flatMap((parent, parentIndex) => {
    if (!parent.children || parent.children.length === 0) return [];
    
    return parent.children.map((child, childIndex) => {
      const position = {
        x: childIndex * 200 + 100,
        y: 270,
        parentX: parentPositions[parentIndex].x,
        parentY: parentPositions[parentIndex].y,
        child
      };
      return position;
    });
  }).map((item, index) => ({ ...item, x: index * 200 + 100 }));

  const totalWidth = Math.max(
    costCenters.length * 300,
    childrenData.length * 200,
    600
  );

  return (
    <div className="relative" style={{ width: totalWidth, height: 370 }}>
      <svg 
        className="absolute inset-0 pointer-events-none" 
        width={totalWidth} 
        height={370}
      >
        {/* EPS to Parents lines */}
        {costCenters.map((_, index) => (
          <g key={`eps-${index}`}>
            <line
              x1={epsPosition.x}
              y1={60}
              x2={epsPosition.x}
              y2={90}
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <line
              x1={Math.min(epsPosition.x, parentPositions[index].x)}
              y1={90}
              x2={Math.max(epsPosition.x, parentPositions[index].x)}
              y2={90}
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <line
              x1={parentPositions[index].x}
              y1={90}
              x2={parentPositions[index].x}
              y2={120}
              stroke="#9CA3AF"
              strokeWidth="2"
            />
          </g>
        ))}
        
        {/* Parents to Children lines */}
        {childrenData.map((childData, index) => {
          const parentIndex = costCenters.findIndex(p => 
            p.children?.some(c => c.id === childData.child.id)
          );
          const parentX = parentPositions[parentIndex]?.x || 0;
          
          return (
            <g key={index}>
              <line
                x1={parentX}
                y1={160}
                x2={parentX}
                y2={200}
                stroke="#9CA3AF"
                strokeWidth="2"
              />
              <line
                x1={Math.min(parentX, childData.x)}
                y1={200}
                x2={Math.max(parentX, childData.x)}
                y2={200}
                stroke="#9CA3AF"
                strokeWidth="2"
              />
              <line
                x1={childData.x}
                y1={200}
                x2={childData.x}
                y2={240}
                stroke="#9CA3AF"
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>

      {/* Level 0: EPS Root */}
      <div
        className="absolute bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 shadow-lg group"
        style={{
          left: epsPosition.x - 100,
          top: epsPosition.y,
          width: 200
        }}
      >
        <div className="flex items-center justify-center">
          <Building2 className="h-6 w-6 mr-2" />
          <div className="font-bold text-lg">EPS</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center mt-1">
          EPS Couriers
        </div>
      </div>

      {/* Level 1: Parents */}
      {costCenters.map((parent, index) => (
        <div
          key={parent.id}
          className="absolute bg-blue-50 border-2 border-blue-200 rounded-lg p-3 shadow-md group hover:bg-blue-100 transition-colors"
          style={{
            left: parentPositions[index].x - 100,
            top: parentPositions[index].y,
            width: 200
          }}
        >
          <div className="flex items-center justify-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            <div className="font-semibold text-blue-900">{parent.company}</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-700 text-center mt-1">
            {parent.cost_code}
          </div>
        </div>
      ))}

      {/* Level 2: Children */}
      {childrenData.map((childData, index) => (
        <div
          key={childData.child.id}
          className="absolute bg-white border border-gray-300 rounded-lg p-3 shadow-sm group hover:bg-gray-50 transition-colors"
          style={{
            left: childData.x - 90,
            top: childData.y,
            width: 180
          }}
        >
          <div className="flex items-center justify-center">
            <Building2 className="h-4 w-4 mr-2 text-gray-600" />
            <div className="font-medium text-gray-900 text-sm text-center">
              {childData.child.company} - {childData.child.branch}
              {childData.child.sub_branch && ` / ${childData.child.sub_branch}`}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-600 text-center mt-1">
            {childData.child.cost_code}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CostCenterPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCostCenters = async () => {
    try {
      const [
        { data: parentCenters },
        { data: level3Centers }
      ] = await Promise.all([
        supabase.from('cost_centers').select('*'),
        supabase.from('level_3_cost_centers').select('*')
      ]);

      // Build tree structure
      const tree = (parentCenters || []).map(parent => ({
        ...parent,
        children: (level3Centers || []).filter(child => 
          child.parent_cost_code === parent.cost_code
        )
      }));

      setCostCenters(tree);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const totalParents = costCenters.length;
  const totalChildren = costCenters.reduce((sum, parent) => sum + (parent.children?.length || 0), 0);

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold">Cost Centers</h1>
        <p className="text-gray-500">Hierarchical view of cost centers and their sub-centers</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Parent Centers</p>
              <p className="text-xl font-semibold">{totalParents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Sub Centers</p>
              <p className="text-xl font-semibold">{totalChildren}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Total Centers</p>
              <p className="text-xl font-semibold">{totalParents + totalChildren}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>EPS Cost Center Hierarchy</CardTitle>
          <p className="text-sm text-gray-600">Hover over boxes to see cost codes</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading cost centers...</div>
          ) : costCenters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cost centers found</div>
          ) : (
            <LevelTreeDiagram costCenters={costCenters} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}