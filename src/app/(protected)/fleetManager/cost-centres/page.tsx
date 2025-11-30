"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Building2 } from "lucide-react";
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

const TreeNode = ({ node, level = 0 }: { node: CostCenter; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="w-full">
      <div 
        className={`flex items-center p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
          level === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
        }`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />
        ) : (
          <div className="w-4 h-4 mr-2" />
        )}
        <Building2 className={`h-5 w-5 mr-3 ${
          level === 0 ? 'text-blue-600' : 'text-gray-600'
        }`} />
        <div className="flex-1">
          <div className={`font-medium ${
            level === 0 ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {node.cost_code}
          </div>
          <div className="text-sm text-gray-600">{node.company}</div>
        </div>
        {hasChildren && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {node.children.length} children
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id} 
              node={{
                id: child.id.toString(),
                cost_code: child.cost_code,
                company: `${child.company} - ${child.branch}${child.sub_branch ? ` / ${child.sub_branch}` : ''}`,
                children: []
              }} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CostCentresPage() {
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

      {/* Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Center Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading cost centers...</div>
          ) : costCenters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cost centers found</div>
          ) : (
            <div className="space-y-4">
              {costCenters.map((center) => (
                <TreeNode key={center.id} node={center} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
