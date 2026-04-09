<template>
  <div class="dashboard">

    <!-- ══════════════ SIDEBAR ══════════════ -->
    <aside class="sidebar">
      <div class="sidebar-brand">Sistema Empresarial</div>

      <div class="sidebar-profile">
        <div class="avatar">👤</div>
        <div class="profile-name">{{ session.nombre }}</div>
        <div class="profile-role">{{ currentMode === 'admin' ? 'Administrador' : 'Empleado' }}</div>
      </div>

      <ul class="nav-list">
        <li class="nav-item">
          <button @click="page = 'buscar'" :class="{ active: page === 'buscar' }">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Buscar
          </button>
        </li>
        <li class="nav-item">
          <button @click="page = 'empleados'" :class="{ active: page === 'empleados' }">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Empleados
          </button>
        </li>
        <li class="nav-item">
          <button @click="page = 'productos'" :class="{ active: page === 'productos' }">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Productos
          </button>
        </li>
        <li class="nav-item">
          <button @click="page = 'ventas'" :class="{ active: page === 'ventas' }">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            Ventas
          </button>
        </li>
      </ul>

      <div class="sidebar-footer">
        <div class="mode-label">Modo de Vista</div>
        <div class="mode-toggle">
          <button class="mode-btn" :class="{ active: currentMode === 'admin' }"    @click="currentMode = 'admin'">Admin</button>
          <button class="mode-btn" :class="{ active: currentMode === 'empleado' }" @click="currentMode = 'empleado'">Empleado</button>
        </div>
      </div>
    </aside>

    <!-- ══════════════ MAIN ══════════════ -->
    <main class="main">

      <!-- ── BUSCAR ── -->
      <div v-if="page === 'buscar'" class="page-section">
        <div class="page-header">
          <div class="page-title">
            <h1>Búsqueda</h1>
            <p>Busca empleados o productos en el sistema</p>
          </div>
        </div>
        <div class="search-box-wrap">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="search-box-input" placeholder="Buscar empleados o productos..."
            v-model="searchQuery" @input="doSearch">
        </div>
        <div>
          <div v-if="!searchQuery" class="empty-state">
            <div class="icon">🔍</div>
            <p>Ingresa un término de búsqueda para comenzar</p>
          </div>
          <div v-else-if="searchResults.length === 0" class="empty-state">
            <div class="icon">😕</div>
            <p>No se encontraron resultados para "<strong>{{ searchQuery }}</strong>"</p>
          </div>
          <div v-else class="search-results">
            <div class="search-result-item" v-for="r in searchResults" :key="r.id"
              @click="page = r.tipo === 'Empleado' ? 'empleados' : 'productos'">
              <div class="result-icon">{{ r.icon }}</div>
              <div>
                <div class="result-name">{{ r.nombre }}</div>
                <div class="result-sub">{{ r.sub }}</div>
              </div>
              <span class="result-type">{{ r.tipo }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── EMPLEADOS ── -->
      <div v-if="page === 'empleados'" class="page-section">
        <div class="page-header">
          <div class="page-title">
            <h1>Gestión de Empleados</h1>
            <p>Administra el equipo de trabajo</p>
          </div>
          <button v-if="currentMode === 'admin'" class="btn btn-primary" @click="openEmpModal(null)">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Empleado
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div>
              <div class="stat-label">Total Empleados</div>
              <div class="stat-value">{{ employees.length }}</div>
            </div>
            <div class="stat-icon" style="background:#ebf4ff">👥</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Activos</div>
              <div class="stat-value" style="color:var(--green)">{{ employees.filter(e=>e.estado==='Activo').length }}</div>
            </div>
            <div class="stat-icon" style="background:var(--green-light)">✅</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Nómina Total</div>
              <div class="stat-value" style="color:var(--accent);font-size:20px">
                ${{ employees.filter(e=>e.estado==='Activo').reduce((s,e)=>s+e.salario,0).toLocaleString() }}
              </div>
            </div>
            <div class="stat-icon" style="background:var(--accent-light)">💰</div>
          </div>
        </div>

        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Empleado</th><th>Contacto</th><th>Fecha Ingreso</th>
                <th>Salario</th><th>Estado</th>
                <th v-if="currentMode === 'admin'">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in employees" :key="e.id">
                <td>
                  <div class="emp-name">{{ e.nombre }}</div>
                  <div class="emp-role">{{ e.cargo }}</div>
                </td>
                <td style="font-size:12px;color:var(--text-muted)">✉️ {{ e.email }}</td>
                <td style="font-size:13px">📅 {{ formatDate(e.fecha) }}</td>
                <td><span class="salary">${{ e.salario.toLocaleString() }}</span></td>
                <td>
                  <span class="badge" :class="e.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'">
                    {{ e.estado }}
                  </span>
                </td>
                <td v-if="currentMode === 'admin'">
                  <div class="action-btns">
                    <button class="icon-btn" @click="openEmpModal(e.id)">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="icon-btn delete" @click="deleteEmployee(e.id)">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── PRODUCTOS ── -->
      <div v-if="page === 'productos'" class="page-section">
        <div class="page-header">
          <div class="page-title">
            <h1>Productos</h1>
            <p>Catálogo e inventario de cócteles</p>
          </div>
        </div>

        <div v-if="productosLoading" class="empty-state">
          <div class="icon">⏳</div>
          <p>Cargando productos...</p>
        </div>
        <template v-else>
          <div class="productos-filters">
            <button class="filter-btn" :class="{ active: productoFiltro === '' }" @click="productoFiltro = ''">Todos</button>
            <button class="filter-btn" v-for="cat in categorias" :key="cat"
              :class="{ active: productoFiltro === cat }" @click="productoFiltro = cat">{{ cat }}</button>
          </div>
          <div class="productos-grid">
            <div class="producto-card" v-for="p in productosFiltrados" :key="p.id" :class="{ inactivo: !p.activo }">
              <div class="producto-emoji">{{ p.imagen }}</div>
              <div class="producto-nombre">{{ p.nombre }}</div>
              <div class="producto-categoria">{{ p.categoria }}</div>
              <div class="producto-descripcion">{{ p.descripcion }}</div>
              <div class="producto-footer">
                <span class="producto-precio">${{ p.precio }}</span>
                <span class="badge" :class="p.activo ? 'badge-disponible' : 'badge-inactivo'">
                  {{ p.activo ? 'Disponible' : 'No disponible' }}
                </span>
              </div>
              <div class="producto-stock">Stock: {{ p.stock }} unidades</div>
            </div>
          </div>
          <div v-if="productosFiltrados.length === 0" class="empty-state">
            <div class="icon">🍹</div>
            <p>No hay productos en esta categoría</p>
          </div>
        </template>
      </div>

      <!-- ── VENTAS ── -->
      <div v-if="page === 'ventas'" class="page-section">
        <div class="page-header">
          <div class="page-title">
            <h1>Reporte de Ventas</h1>
            <p>Visualiza todas las ventas y rendimiento del equipo</p>
          </div>
          <button v-if="currentMode === 'admin'" class="btn btn-primary" @click="openVentaModal">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva Venta
          </button>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div>
              <div class="stat-label">Total Ventas</div>
              <div class="stat-value" style="color:var(--accent);font-size:20px">${{ ventaTotalGeneral.toLocaleString() }}</div>
            </div>
            <div class="stat-icon" style="background:var(--accent-light)">💵</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Número de Ventas</div>
              <div class="stat-value" style="color:var(--green)">{{ ventas.length }}</div>
            </div>
            <div class="stat-icon" style="background:var(--green-light)">🛒</div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-label">Promedio por Venta</div>
              <div class="stat-value" style="color:#9b59b6;font-size:20px">${{ ventaPromedio.toLocaleString() }}</div>
            </div>
            <div class="stat-icon" style="background:#f9f0ff">📈</div>
          </div>
        </div>

        <div style="margin-bottom:24px">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:14px">Rendimiento por Empleado</h3>
          <div class="perf-grid">
            <div class="perf-card" v-for="(data, idx) in empPerformance" :key="data.empId">
              <div v-if="idx === 0" class="top-badge">⭐ Top</div>
              <div class="perf-emp">
                <div class="perf-avatar">👤</div>
                <div>
                  <div class="perf-name">{{ data.nombre }}</div>
                  <div class="perf-sub">{{ data.count }} ventas</div>
                </div>
              </div>
              <div class="perf-total-label">Total generado</div>
              <div class="perf-total">${{ data.total.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 style="font-size:15px;font-weight:700;margin-bottom:14px">Historial de Todas las Ventas</h3>
          <div class="venta-item" v-for="v in [...ventas].reverse()" :key="v.id">
            <div class="venta-header">
              <div>
                <div class="venta-id">Venta #{{ v.id }}</div>
                <div class="venta-emp">Empleado: {{ nombreEmpleado(v.empleadoId) }}</div>
              </div>
              <div>
                <div class="venta-total">${{ ventaTotal(v).toLocaleString() }}</div>
                <div class="venta-date">{{ formatDateLong(v.fecha) }}</div>
              </div>
            </div>
            <div class="venta-products-title">Productos Vendidos:</div>
            <div class="venta-product-row" v-for="p in v.productos" :key="p.nombre">
              <span>{{ p.nombre }} <span style="color:var(--text-muted)">{{ p.qty }} x ${{ p.precio }}</span></span>
              <span style="font-family:'DM Mono',monospace;font-size:13px">${{ (p.qty * p.precio).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- ══ MODAL EMPLEADO ══ -->
    <div class="modal-overlay" :class="{ open: empModal.open }" @click.self="empModal.open = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ empModal.editId ? 'Editar Empleado' : 'Nuevo Empleado' }}</span>
          <button class="modal-close" @click="empModal.open = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label">Nombre Completo</label>
            <input type="text" class="form-input" v-model="empForm.nombre" placeholder="Ej: María González">
          </div>
          <div class="form-group">
            <label class="form-label">Cargo</label>
            <input type="text" class="form-input" v-model="empForm.cargo" placeholder="Ej: Bartender">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" v-model="empForm.email" placeholder="nombre@empresa.com">
          </div>
          <div class="form-group">
            <label class="form-label">Fecha Ingreso</label>
            <input type="date" class="form-input" v-model="empForm.fecha">
          </div>
          <div class="form-group">
            <label class="form-label">Salario ($)</label>
            <input type="number" class="form-input" v-model="empForm.salario" placeholder="0" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-select" v-model="empForm.estado">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="empModal.open = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveEmployee">Guardar</button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL VENTA ══ -->
    <div class="modal-overlay" :class="{ open: ventaModal.open }" @click.self="ventaModal.open = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Nueva Venta</span>
          <button class="modal-close" @click="ventaModal.open = false">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label">Empleado</label>
            <select class="form-select" v-model="ventaForm.empleadoId">
              <option v-for="e in employees.filter(e=>e.estado==='Activo')" :key="e.id" :value="e.id">{{ e.nombre }}</option>
            </select>
          </div>
          <div class="form-group full">
            <label class="form-label">Producto</label>
            <select class="form-select" v-model="ventaForm.productoId" @change="updateVentaPrecio">
              <option v-for="p in productos.filter(p=>p.activo)" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Cantidad</label>
            <input type="number" class="form-input" v-model="ventaForm.cantidad" min="1">
          </div>
          <div class="form-group">
            <label class="form-label">Precio Unitario ($)</label>
            <input type="number" class="form-input" :value="ventaForm.precio" readonly style="background:#f8fafc">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="ventaModal.open = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveVenta">Registrar Venta</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast" :class="{ show: toast.visible }">{{ toast.message }}</div>

  </div>
</template>

<script src="./DashboardView.js"></script>
<style scoped src="./DashboardView.css"></style>

