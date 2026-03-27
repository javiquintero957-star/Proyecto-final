// ══════════════════════════════════════════
//  user.js  —  Lógica Vue del Dashboard
// ══════════════════════════════════════════

const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
  setup() {
    const session     = reactive({ nombre: 'Usuario', email: '', rol: 'empleado' });
    const currentMode = ref('admin');
    const page        = ref('buscar');

    const employees = ref([
      { id:'emp-1', nombre:'María González',  cargo:'Bartender Principal', email:'maria@coctel.com', fecha:'2023-01-14', salario:2500, estado:'Activo' },
      { id:'emp-2', nombre:'Juan Pérez',       cargo:'Asistente de Bar',    email:'juan@coctel.com',  fecha:'2022-06-09', salario:2200, estado:'Activo' },
      { id:'emp-3', nombre:'Ana Rodríguez',    cargo:'Bartender',           email:'ana@coctel.com',   fecha:'2023-08-19', salario:2400, estado:'Activo' },
      { id:'emp-4', nombre:'Luis Martínez',    cargo:'Mesero',              email:'luis@coctel.com',  fecha:'2021-11-04', salario:2300, estado:'Inactivo' }
    ]);

    const ventas = ref([
      { id:'venta-1', empleadoId:'emp-1', fecha:'2026-03-19', productos:[{nombre:'Mojito Clásico',qty:4,precio:12},{nombre:'Margarita',qty:2,precio:14}] },
      { id:'venta-2', empleadoId:'emp-1', fecha:'2026-03-18', productos:[{nombre:'Piña Colada',qty:3,precio:13},{nombre:'Negroni',qty:2,precio:16}] },
      { id:'venta-3', empleadoId:'emp-3', fecha:'2026-03-17', productos:[{nombre:'Aperol Spritz',qty:5,precio:11},{nombre:'Cosmopolitan',qty:2,precio:15}] },
      { id:'venta-4', empleadoId:'emp-1', fecha:'2026-03-16', productos:[{nombre:'Old Fashioned',qty:2,precio:18}] },
      { id:'venta-5', empleadoId:'emp-3', fecha:'2026-03-15', productos:[{nombre:'Daiquiri de Fresa',qty:4,precio:13}] }
    ]);

    const productos        = ref([]);
    const productosLoading = ref(true);
    const productoFiltro   = ref('');
    const searchQuery      = ref('');
    const searchResults    = ref([]);

    const empModal   = reactive({ open: false, editId: null });
    const empForm    = reactive({ nombre:'', cargo:'', email:'', fecha:'', salario:0, estado:'Activo' });
    const ventaModal = reactive({ open: false });
    const ventaForm  = reactive({ empleadoId:'', productoId:'', cantidad:1, precio:0 });
    const toast      = reactive({ visible: false, message: '' });

    onMounted(async () => {
      try {
        const s = JSON.parse(localStorage.getItem('coctel_session') || '{}');
        if (s.nombre) { session.nombre = s.nombre; session.email = s.email; session.rol = s.rol; }
      } catch {}

      try {
        const res = await fetch('productos.json');
        productos.value = await res.json();
      } catch {
        productos.value = [
          { id:'p1', nombre:'Mojito Clásico', categoria:'Cócteles Clásicos', precio:12, stock:50, descripcion:'Ron blanco, menta, lima y soda', imagen:'🍹', activo:true },
          { id:'p2', nombre:'Margarita',      categoria:'Cócteles Clásicos', precio:14, stock:45, descripcion:'Tequila, triple sec y lima',     imagen:'🍸', activo:true },
          { id:'p3', nombre:'Piña Colada',    categoria:'Tropicales',        precio:13, stock:40, descripcion:'Ron, coco y piña',               imagen:'🥥', activo:true },
          { id:'p4', nombre:'Aperol Spritz',  categoria:'Refrescantes',      precio:11, stock:60, descripcion:'Aperol, prosecco y naranja',      imagen:'🍾', activo:true },
          { id:'p5', nombre:'Negroni',        categoria:'Cócteles Clásicos', precio:16, stock:25, descripcion:'Gin, vermut y Campari',           imagen:'🍊', activo:true }
        ];
      }
      productosLoading.value = false;
    });

    // Computed
    const categorias        = computed(() => [...new Set(productos.value.map(p => p.categoria))]);
    const productosFiltrados = computed(() =>
      productoFiltro.value ? productos.value.filter(p => p.categoria === productoFiltro.value) : productos.value
    );
    const ventaTotalGeneral = computed(() => ventas.value.reduce((s, v) => s + ventaTotal(v), 0));
    const ventaPromedio     = computed(() => ventas.value.length ? Math.round(ventaTotalGeneral.value / ventas.value.length) : 0);
    const empPerformance    = computed(() => {
      const map = {};
      ventas.value.forEach(v => {
        if (!map[v.empleadoId]) map[v.empleadoId] = { count:0, total:0 };
        map[v.empleadoId].count++;
        map[v.empleadoId].total += ventaTotal(v);
      });
      return Object.entries(map).sort((a,b) => b[1].total - a[1].total).map(([empId, data]) => {
        const emp = employees.value.find(e => e.id === empId);
        return { empId, nombre: emp ? emp.nombre : 'Desconocido', ...data };
      });
    });

    // Métodos
    function ventaTotal(v)       { return v.productos.reduce((s, p) => s + p.qty * p.precio, 0); }
    function nombreEmpleado(id)  { const e = employees.value.find(e => e.id === id); return e ? e.nombre : '-'; }
    function formatDate(d)       { if (!d) return '-'; const [y,m,day]=d.split('-'); return `${parseInt(day)}/${parseInt(m)}/${y}`; }
    function formatDateLong(d) {
      if (!d) return '-';
      const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const date = new Date(d + 'T00:00:00');
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    }
    function showToast(msg) { toast.message = msg; toast.visible = true; setTimeout(() => { toast.visible = false; }, 2800); }

    function doSearch() {
      const q = searchQuery.value.toLowerCase().trim();
      if (!q) { searchResults.value = []; return; }
      const empRes  = employees.value.filter(e => e.nombre.toLowerCase().includes(q) || e.cargo.toLowerCase().includes(q)).map(e => ({ id:e.id, tipo:'Empleado', icon:'👤', nombre:e.nombre, sub:`${e.cargo} · ${e.email}` }));
      const prodRes = productos.value.filter(p => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)).map(p => ({ id:p.id, tipo:'Producto', icon:p.imagen, nombre:p.nombre, sub:`${p.categoria} · $${p.precio}` }));
      searchResults.value = [...empRes, ...prodRes];
    }

    function openEmpModal(id) {
      empModal.editId = id;
      if (id) { Object.assign(empForm, { ...employees.value.find(x => x.id === id) }); }
      else    { Object.assign(empForm, { nombre:'', cargo:'', email:'', fecha:'', salario:0, estado:'Activo' }); }
      empModal.open = true;
    }
    function saveEmployee() {
      if (!empForm.nombre.trim()) { showToast('⚠️ El nombre es obligatorio'); return; }
      const data = { id: empModal.editId || 'emp-'+Date.now(), nombre:empForm.nombre.trim(), cargo:empForm.cargo.trim(), email:empForm.email.trim(), fecha:empForm.fecha, salario:parseFloat(empForm.salario)||0, estado:empForm.estado };
      if (empModal.editId) { const idx = employees.value.findIndex(x => x.id === empModal.editId); employees.value[idx] = data; showToast('✅ Empleado actualizado'); }
      else                 { employees.value.push(data); showToast('✅ Empleado agregado'); }
      empModal.open = false;
    }
    function deleteEmployee(id) {
      if (!confirm('¿Eliminar este empleado?')) return;
      employees.value = employees.value.filter(e => e.id !== id);
      showToast('🗑️ Empleado eliminado');
    }

    function openVentaModal() {
      ventaForm.empleadoId = employees.value.find(e => e.estado === 'Activo')?.id || '';
      ventaForm.productoId = productos.value.find(p => p.activo)?.id || '';
      ventaForm.cantidad   = 1;
      updateVentaPrecio();
      ventaModal.open = true;
    }
    function updateVentaPrecio() { const p = productos.value.find(x => x.id === ventaForm.productoId); ventaForm.precio = p ? p.precio : 0; }
    function saveVenta() {
      const prod = productos.value.find(p => p.id === ventaForm.productoId);
      if (!ventaForm.empleadoId || !prod) { showToast('⚠️ Completa todos los campos'); return; }
      ventas.value.push({ id:'venta-'+Date.now(), empleadoId:ventaForm.empleadoId, fecha:new Date().toISOString().split('T')[0], productos:[{nombre:prod.nombre, qty:parseInt(ventaForm.cantidad)||1, precio:prod.precio}] });
      ventaModal.open = false;
      showToast('✅ Venta registrada');
    }

    return {
      session, currentMode, page,
      employees, ventas, productos, productosLoading,
      productoFiltro, categorias, productosFiltrados,
      searchQuery, searchResults, doSearch,
      empModal, empForm, openEmpModal, saveEmployee, deleteEmployee,
      ventaModal, ventaForm, openVentaModal, updateVentaPrecio, saveVenta,
      ventaTotalGeneral, ventaPromedio, empPerformance,
      ventaTotal, nombreEmpleado, formatDate, formatDateLong, toast
    };
  }
}).mount('#app');
