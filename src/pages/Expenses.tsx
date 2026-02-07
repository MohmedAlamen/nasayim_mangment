import React, { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Plus, Wallet, TrendingDown, Calendar, MoreVertical, Loader2, Receipt } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenses, useDeleteExpense, useExpenseStats, Expense } from '@/hooks/useExpenses';
import ExpenseDialog from '@/components/expenses/ExpenseDialog';
import DeleteDialog from '@/components/shared/DeleteDialog';

const categoryLabels: Record<string, { ar: string; en: string; color: string }> = {
  materials: { ar: 'مواد ومستلزمات', en: 'Materials', color: 'bg-blue-100 text-blue-700' },
  fuel: { ar: 'وقود ومواصلات', en: 'Fuel', color: 'bg-amber-100 text-amber-700' },
  salaries: { ar: 'رواتب وأجور', en: 'Salaries', color: 'bg-purple-100 text-purple-700' },
  rent: { ar: 'إيجار', en: 'Rent', color: 'bg-pink-100 text-pink-700' },
  utilities: { ar: 'فواتير خدمات', en: 'Utilities', color: 'bg-cyan-100 text-cyan-700' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'bg-orange-100 text-orange-700' },
  marketing: { ar: 'تسويق وإعلان', en: 'Marketing', color: 'bg-indigo-100 text-indigo-700' },
  equipment: { ar: 'معدات وأجهزة', en: 'Equipment', color: 'bg-teal-100 text-teal-700' },
  general: { ar: 'مصروفات عامة', en: 'General', color: 'bg-gray-100 text-gray-700' },
};

const Expenses: React.FC = () => {
  const { t, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useExpenses();
  const { data: stats } = useExpenseStats();
  const deleteExpense = useDeleteExpense();

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedExpense) {
      await deleteExpense.mutateAsync(selectedExpense.id);
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const handleAdd = () => {
    setSelectedExpense(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {dir === 'rtl' ? 'المصروفات' : 'Expenses'}
          </h1>
          <p className="text-muted-foreground">
            {dir === 'rtl' ? 'إدارة وتتبع المصروفات' : 'Manage and track expenses'}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {dir === 'rtl' ? 'إضافة مصروف' : 'Add Expense'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'مصروفات الشهر' : 'Monthly Expenses'}
              </p>
              <p className="text-2xl font-bold text-destructive">
                {stats?.totalMonthly?.toLocaleString() || 0} {t('currency')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'عدد العمليات' : 'Transactions'}
              </p>
              <p className="text-2xl font-bold">{stats?.count || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <Wallet className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'الفئة الأعلى' : 'Top Category'}
              </p>
              <p className="text-lg font-bold">
                {stats?.byCategory
                  ? categoryLabels[
                      Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || 'general'
                    ]?.[dir === 'rtl' ? 'ar' : 'en'] || '-'
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            {dir === 'rtl' ? 'سجل المصروفات' : 'Expense Log'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dir === 'rtl' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{dir === 'rtl' ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead>{dir === 'rtl' ? 'الفئة' : 'Category'}</TableHead>
                    <TableHead className="text-end">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(expense.expense_date), 'dd MMM yyyy', {
                            locale: dir === 'rtl' ? ar : undefined,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          {expense.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={categoryLabels[expense.category]?.color || 'bg-gray-100 text-gray-700'}
                        >
                          {categoryLabels[expense.category]?.[dir === 'rtl' ? 'ar' : 'en'] || expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end font-bold text-destructive">
                        -{expense.amount.toLocaleString()} {t('currency')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                              {dir === 'rtl' ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(expense)}
                                className="text-destructive"
                              >
                                {dir === 'rtl' ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dir === 'rtl' ? 'لا توجد مصروفات مسجلة' : 'No expenses recorded'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={selectedExpense} />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isLoading={deleteExpense.isPending}
        title={dir === 'rtl' ? 'حذف المصروف' : 'Delete Expense'}
      />
    </div>
  );
};

export default Expenses;
