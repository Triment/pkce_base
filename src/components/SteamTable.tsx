import { useState, useMemo, useCallback } from 'react'; // Removed useEffect
import { Pagination, SortDescriptor, Spinner } from '@heroui/react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue
} from '@heroui/react';
import React from 'react';
// Import the hook and types
import { useMarketData, CombinedItem } from '../hooks/useMarketData'; 

// Types are now defined in useMarketData.ts, keep props interface
// interface SteamItemRaw { ... }
// interface CombinedItem extends SteamItemRaw { ... }

// Props for the component
interface SteamTableProps {
  accessToken: string | null;
  domain: string;
  itemsPerPage?: number;
}

// Constants for fees are now handled within useMarketData hook

export const SteamTable = ({
  accessToken,
  domain,
  itemsPerPage = 10
}: SteamTableProps) => {
  // --- State Management ---
  const [currentPage, setCurrentPage] = useState(1);
  // UI state for sorting
  const [sortConfig, setSortConfig] = useState<SortDescriptor>({
    column: "sell_listings", // Default sort column
    direction: "descending",
  });

  // --- Data Fetching ---
  // Use the custom hook to get combined data, loading, error, and rate
  const { 
    combinedData: rawCombinedData, // Data before client-side sorting
    totalCount, 
    loading, 
    error, 
    usdToCnyRate 
  } = useMarketData({
    accessToken,
    domain,
    currentPage,
    itemsPerPage,
  });

  // --- Client-Side Sorting ---
  // Apply sorting to the data received from the hook
  const combinedAndSortedData = useMemo(() => {
    // Return empty array if data is not ready
    if (!rawCombinedData || rawCombinedData.length === 0) return []; 

    // Sort the data based on the current sortConfig
    return [...rawCombinedData].sort((a, b) => { // Create a copy before sorting
      // Use optional chaining and nullish coalescing for safety
      const firstValue = getKeyValue(a, sortConfig.column ?? '') ?? -Infinity;
      const secondValue = getKeyValue(b, sortConfig.column ?? '') ?? -Infinity;
      
      // Basic comparison logic (adjust if specific numeric/string comparison needed)
      let cmp = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

      // Apply direction
      if (sortConfig.direction === "descending") {
        cmp *= -1;
      }
      return cmp;
    });
  }, [rawCombinedData, sortConfig]); // Re-sort when data or sort config changes

  // --- Column Definitions ---
  // (Keep this section largely the same, adjust labels if desired)
  const columns = [
    { key: "hash_name", label: "物品名称", allowsSorting: true },
    { key: "sell_listings", label: "Steam在售", allowsSorting: true },
    { key: "sell_price_text", label: "Steam价格", allowsSorting: true },
    { key: "buff_price_cny", label: "Buff价格(¥)", allowsSorting: true },
    { key: "profit_margin_buff_to_steam", label: "利润率(B->S)", allowsSorting: true },
    { key: "profit_margin_steam_to_buff", label: "利润率(S->B)", allowsSorting: true },
    { key: "total_profit_buff_to_steam", label: "总利润(B->S)", allowsSorting: true },
    { key: "total_profit_steam_to_buff", label: "总利润(S->B)", allowsSorting: true },
    { key: "app_name", label: "所属游戏", allowsSorting: false },
    { key: "icon", label: "图标", allowsSorting: false },
  ];

  // --- Cell Rendering ---
  // (Keep this section largely the same)
  const renderCell = useCallback((item: CombinedItem, columnKey: React.Key): React.ReactNode => {
    const cellValue = getKeyValue(item, columnKey as string);

    switch (columnKey) {
      case "icon":
        return (
          <img
            src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.asset_description?.icon_url}`} // Optional chaining for safety
            className="w-8 h-8"
            alt={item.hash_name} // Use item name for alt text
          />
        );
      case "buff_price_cny":
        // Show spinner only if loading is true and value is undefined
        return loading && cellValue === undefined ? <Spinner size="sm"/> :
               cellValue === null ? <span className="text-gray-400">查询失败</span> :
               cellValue !== undefined ? `¥${Number(cellValue).toFixed(2)}` : ''; // Handle undefined case after loading
      case "profit_margin_buff_to_steam":
      case "profit_margin_steam_to_buff":
         return cellValue === undefined ? '' : `${Number(cellValue).toFixed(2)}%`;
      case "total_profit_buff_to_steam":
      case "total_profit_steam_to_buff":
         return cellValue === undefined ? '' : `¥${Number(cellValue).toFixed(2)}`;
      default:
        return cellValue ?? ''; // Render empty string for null/undefined default values
    }
  }, [loading]); // Add loading dependency for spinner logic in buff_price_cny


  // --- Render Logic ---

  // Initial loading state (before any data is available)
  if (loading && combinedAndSortedData.length === 0 && !error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Spinner label="加载市场数据中..." color="primary" labelColor="primary"/>
        {/* Optionally show sub-status like "获取汇率..." if needed */}
      </div>
    );
  }

  return (
    <div className="p-4">
       {/* Display Error */}
       {error && (
         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
           数据加载出错: {error}
         </div>
       )}

       {/* Display Exchange Rate */}
       <div className="mb-2 text-sm text-gray-600">
         {/* Show spinner only if rate is loading AND value is null */}
         {loading && !usdToCnyRate ? <Spinner size="sm" className="mr-2"/> : 
          usdToCnyRate ? `当前汇率: 1 USD = ${usdToCnyRate.toFixed(4)} CNY` : 
          !error ? '正在加载汇率...' : '无法加载汇率'} 
       </div>

      <Table
        aria-label="Steam Market Items Comparison"
        // Use the state setter from useState for sorting
        sortDescriptor={sortConfig}
        onSortChange={setSortConfig}
        classNames={{ 
            wrapper: "border rounded-lg shadow-lg min-h-[200px]", 
            th: "bg-gray-100 text-black/80", 
        }}
        // Show spinner at top when loading subsequent pages/data
        topContent={loading && combinedAndSortedData.length > 0 ? <Spinner label="更新数据中..." color="primary"/> : null} 
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn allowsSorting={column.allowsSorting} key={column.key}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody 
            items={combinedAndSortedData} // Use the client-side sorted data
            // Show overlay spinner when loading new data but old data exists
            isLoading={loading && combinedAndSortedData.length > 0} 
            loadingContent={<Spinner label="加载中..." />}
            // Show "No items" only if not loading and no error occurred
            emptyContent={!loading && !error ? "没有找到物品" : " "} 
        >
          {(item: CombinedItem) => (
            <TableRow key={item.hash_name}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalCount > 0 && (
         <div className="flex justify-center mt-4">
           <Pagination
             isCompact
             showControls
             total={Math.ceil(totalCount / itemsPerPage)}
             initialPage={currentPage}
             onChange={setCurrentPage}
             classNames={{ cursor: "bg-blue-500 text-white" }}
           />
         </div>
      )}
    </div>
  );
};
