export function getSupplierForProduct(productId, products, suppliers) {
  const product = products.find(item => String(item.id) === String(productId))
  if (!product?.supplierId) return null

  return suppliers.find(supplier => String(supplier.id) === String(product.supplierId)) ?? null
}

export function getSupplierIdForCategory(category, suppliers) {
  return suppliers.find(supplier => supplier.kategori === category)?.id ?? null
}
