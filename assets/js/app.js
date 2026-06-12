/**
 * Códice v2 - Lógica para a Adri
 */

const app = {
    currentDoc: null,
    docs: [],
    templates: {
        abnt2: {
            name: "Acadêmico (ABNT2)",
            fields: [
                { id: 'inst', label: 'Instituição', type: 'text' },
                { id: 'course', label: 'Curso', type: 'text' },
                { id: 'author', label: 'Autor(a)', type: 'text' },
                { id: 'title', label: 'Título Principal', type: 'text' },
                { id: 'subtitle', label: 'Subtítulo', type: 'text' },
                { id: 'city', label: 'Cidade', type: 'text' },
                { id: 'year', label: 'Ano', type: 'number' },
                { id: 'abstract', label: 'Resumo / Abstract', type: 'textarea' },
                { id: 'body', label: 'Corpo do Trabalho', type: 'textarea' },
                { id: 'refs', label: 'Referências Bibliográficas', type: 'textarea' }
            ]
        },
        literatura: {
            name: "Literatura (Projeto)",
            fields: [
                { id: 'title', label: 'Título da Obra', type: 'text' },
                { id: 'author', label: 'Pseudônimo/Autor', type: 'text' },
                { id: 'synopsis', label: 'Sinopse/Resumo do Projeto', type: 'textarea' },
                { id: 'body', label: 'Conteúdo (Capítulos, links e referências)', type: 'textarea' },
                { id: 'links', label: 'Links de Referência / Pesquisa (um por linha)', type: 'textarea' }
            ]
        },
        adm: {
            name: "Ata de Reunião",
            fields: [
                { id: 'title', label: 'Título da Ata', type: 'text' },
                { id: 'date', label: 'Data da Reunião', type: 'date' },
                { id: 'local', label: 'Local/Plataforma', type: 'text' },
                { id: 'participants', label: 'Participantes', type: 'textarea' },
                { id: 'agenda', label: 'Pauta', type: 'textarea' },
                { id: 'decisions', label: 'Deliberações/Decisões', type: 'textarea' }
            ]
        },
        relatorio: {
            name: "Relatório Técnico",
            fields: [
                { id: 'title', label: 'Título do Relatório', type: 'text' },
                { id: 'intro', label: 'Introdução / Objetivo', type: 'textarea' },
                { id: 'body', label: 'Desenvolvimento / Atividades', type: 'textarea' },
                { id: 'results', label: 'Resultados / Conclusão', type: 'textarea' }
            ]
        },
        lista: {
            name: "Lista / Check-list",
            fields: [
                { id: 'title', label: 'Nome da Lista', type: 'text' },
                { id: 'body', label: 'Itens (um por linha)', type: 'textarea' }
            ]
        },
        poesia: {
            name: "Poesia / Música",
            fields: [
                { id: 'title', label: 'Título', type: 'text' },
                { id: 'body', label: 'Versos/Estrofes', type: 'textarea' }
            ]
        },
        livre: {
            name: "Escrita Livre",
            fields: [
                { id: 'title', label: 'Título', type: 'text' },
                { id: 'body', label: 'Texto', type: 'textarea' }
            ]
        }
    },

    init() {
        this.loadSettings();
        this.showDashboard();
        this.bindEvents();
        this.fetchDocs();
    },

    loadSettings() {
        const url = localStorage.getItem('codice_sheets_url');
        if (url) document.getElementById('sheets-url').value = url;
    },

    bindEvents() {
        document.getElementById('sheets-url').addEventListener('input', (e) => {
            localStorage.setItem('codice_sheets_url', e.target.value);
        });

        document.getElementById('btn-save-cloud').addEventListener('click', () => this.saveDoc());
    },

    announce(msg) {
        const announcer = document.getElementById('status-announcer');
        announcer.innerText = msg;
    },

    showDashboard() {
        document.getElementById('view-dashboard').style.display = 'block';
        document.getElementById('view-editor').style.display = 'none';
        this.currentDoc = null;
        this.fetchDocs();
    },

    showEditor(doc) {
        document.getElementById('view-dashboard').style.display = 'none';
        document.getElementById('view-editor').style.display = 'block';
        this.currentDoc = doc;
        this.renderFields(doc.template);
        this.fillFields(doc);
        
        // Aplica formatação salva se existir
        if (doc.metadata && doc.metadata.format) {
            const f = doc.metadata.format;
            document.getElementById('font-size').value = f.size;
            document.getElementById('font-color').value = f.color;
            document.getElementById('bg-editor-color').value = f.bgColor;
            this.applyFormatting();
        } else {
            // Reset para o padrão do navegador se não houver meta
            document.getElementById('font-size').value = "12pt";
            document.getElementById('font-color').value = "#212529";
            document.getElementById('bg-editor-color').value = "#ffffff";
            this.applyFormatting();
        }

        document.getElementById('editor-title-display').innerText = doc.title || "Novo Documento";
    },

    renderFields(templateId) {
        const container = document.getElementById('template-fields');
        container.innerHTML = '';
        const fields = this.templates[templateId].fields;

        fields.forEach(f => {
            if (f.id === 'body') return;

            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'field-wrapper';

            const labelWrapper = document.createElement('div');
            labelWrapper.className = 'label-btn-wrapper';

            const label = document.createElement('label');
            label.innerText = f.label;
            label.htmlFor = `field-${f.id}`;
            
            const btnGroup = document.createElement('div');
            btnGroup.className = 'quick-actions';

            const pasteBtn = document.createElement('button');
            pasteBtn.type = 'button';
            pasteBtn.className = 'btn-paste-quick';
            pasteBtn.innerText = 'Colar';
            pasteBtn.setAttribute('aria-label', `Colar da área de transferência para ${f.label}`);
            pasteBtn.onclick = () => this.pasteToField(`field-${f.id}`);

            const insertBtn = document.createElement('button');
            insertBtn.type = 'button';
            insertBtn.className = 'btn-insert-quick';
            insertBtn.innerText = 'Inserir Link/Imagem';
            insertBtn.setAttribute('aria-label', `Inserir Link ou Imagem em ${f.label}`);
            insertBtn.onclick = () => this.openInsertDialog(`field-${f.id}`);

            btnGroup.appendChild(pasteBtn);
            btnGroup.appendChild(insertBtn);

            labelWrapper.appendChild(label);
            labelWrapper.appendChild(btnGroup);
            
            let input;
            if (f.type === 'textarea') {
                input = document.createElement('textarea');
                input.onblur = (e) => this.saveCursor(f.id, e.target.selectionStart);
            } else {
                input = document.createElement('input');
                input.type = f.type;
            }
            input.id = `field-${f.id}`;
            input.className = 'editor-field';
            
            fieldWrapper.appendChild(labelWrapper);
            fieldWrapper.appendChild(input);
            container.appendChild(fieldWrapper);
        });

        const bodyField = fields.find(f => f.id === 'body');
        if (bodyField) {
            document.getElementById('label-active-editor').innerText = bodyField.label;
        }
    },

    async pasteToField(fieldId) {
        try {
            const text = await navigator.clipboard.readText();
            const el = document.getElementById(fieldId);
            if (el) {
                el.value = text;
                this.announce("Conteúdo colado com sucesso.");
            }
        } catch (err) {
            this.announce("Erro ao acessar área de transferência. Verifique as permissões do navegador.");
            alert("Para colar automaticamente, o navegador precisa de permissão para acessar a área de transferência.");
        }
    },

    fillFields(doc) {
        const content = typeof doc.content === 'string' ? JSON.parse(doc.content || '{}') : doc.content;
        Object.keys(content).forEach(key => {
            const el = document.getElementById(key === 'body' ? 'active-editor' : `field-${key}`);
            if (el) {
                el.value = content[key];
                // Recupera cursor se existir nos metadados
                if (doc.metadata && doc.metadata.cursors && doc.metadata.cursors[key]) {
                    const pos = doc.metadata.cursors[key];
                    setTimeout(() => {
                        el.focus();
                        el.setSelectionRange(pos, pos);
                    }, 100);
                }
            }
        });
    },

    saveCursor(fieldId, pos) {
        if (!this.currentDoc) return;
        this.currentDoc.metadata = this.currentDoc.metadata || {};
        this.currentDoc.metadata.cursors = this.currentDoc.metadata.cursors || {};
        this.currentDoc.metadata.cursors[fieldId] = pos;
    },

    openInsertDialog(fieldId) {
        this.targetField = fieldId;
        document.getElementById('insert-dialog').showModal();
    },

    confirmInsert() {
        const name = document.getElementById('insert-name').value;
        const urlInput = document.getElementById('insert-url').value;
        const fileInput = document.getElementById('file-upload');
        const field = document.getElementById(this.targetField);
        
        if (!name || !field) {
            alert("Por favor, preencha o nome do arquivo.");
            return;
        }

        // Se houver arquivo selecionado, avisar que o processamento é via Zapia
        if (fileInput.files.length > 0) {
            this.announce("Enviando arquivo para processamento... Aguarde a confirmação no chat.");
            alert("Para garantir a permanência, envie o arquivo aqui no nosso chat. Eu vou gerar um link permanente para você colar no campo URL do Códice.");
            document.getElementById('insert-dialog').close();
            return;
        }

        if (urlInput) {
            const tag = `[${name}](${urlInput})`;
            const start = field.selectionStart;
            const text = field.value;
            field.value = text.substring(0, start) + tag + text.substring(field.selectionEnd);
            this.announce(`Inserido: ${name}`);
            document.getElementById('insert-dialog').close();
        }
    },

    getFieldsData() {
        const data = {};
        // Campos fixos
        const inputs = document.querySelectorAll('#template-fields .editor-field');
        inputs.forEach(input => {
            const id = input.id.replace('field-', '');
            data[id] = input.value;
        });
        // Campo do acordeão (body)
        data['body'] = document.getElementById('active-editor').value;
        return data;
    },

    newDoc(templateId) {
        const doc = {
            id: null,
            title: "Novo " + this.templates[templateId].name,
            template: templateId,
            content: {}
        };
        this.showEditor(doc);
    },

    async fetchDocs() {
        const token = localStorage.getItem('codice_github_token');
        const gistId = localStorage.getItem('codice_gist_id');
        
        if (!token || !gistId) {
            this.announce("Sistema local ativo. Conecte ao GitHub nas configurações para sincronizar.");
            const localData = JSON.parse(localStorage.getItem('codice_local_db') || '{"docs": []}');
            this.docs = localData.docs;
            this.renderFileList();
            return;
        }

        this.announce("Sincronizando estante com a nuvem...");
        try {
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: { 'Authorization': `token ${token}` }
            });
            const gist = await res.json();
            const db = JSON.parse(gist.files['codice_db.json'].content);
            this.docs = db.docs;
            localStorage.setItem('codice_local_db', JSON.stringify(db));
            this.renderFileList();
        } catch (err) {
            this.announce("Erro ao carregar da nuvem. Usando dados locais.");
            const localData = JSON.parse(localStorage.getItem('codice_local_db') || '{"docs": []}');
            this.docs = localData.docs;
            this.renderFileList();
        }
    },

    renderFileList() {
        const container = document.getElementById('file-list');
        container.innerHTML = '';

        if (this.docs.length === 0) {
            container.innerHTML = '<p>Sua estante está pronta para receber seu primeiro texto!</p>';
            return;
        }

        this.docs.forEach(doc => {
            const btn = document.createElement('button');
            btn.className = 'list-item';
            btn.innerText = `${doc.title} (${this.templates[doc.template]?.name || doc.template})`;
            btn.onclick = () => this.showEditor(doc);
            container.appendChild(btn);
        });
    },

    async saveDoc() {
        const token = localStorage.getItem('codice_github_token');
        const gistId = localStorage.getItem('codice_gist_id');
        const data = this.getFieldsData();
        
        // Atualiza objeto local
        if (!this.currentDoc.id) this.currentDoc.id = Date.now();
        this.currentDoc.content = JSON.stringify(data);
        this.currentDoc.title = data.title || "Sem título";
        this.currentDoc.metadata = this.currentDoc.metadata || {};
        
        // Salva formato atual nos metadados
        this.currentDoc.metadata.format = {
            size: document.getElementById('font-size').value,
            color: document.getElementById('font-color').value,
            bgColor: document.getElementById('bg-editor-color').value
        };

        let db = JSON.parse(localStorage.getItem('codice_local_db') || '{"docs": []}');
        const index = db.docs.findIndex(d => d.id === this.currentDoc.id);
        if (index > -1) db.docs[index] = this.currentDoc;
        else db.docs.push(this.currentDoc);
        
        localStorage.setItem('codice_local_db', JSON.stringify(db));
        this.docs = db.docs;

        if (token && gistId) {
            this.announce("Sincronizando com a nuvem...");
            try {
                const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                    method: 'PATCH',
                    headers: { 
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        files: { 'codice_db.json': { content: JSON.stringify(db) } }
                    })
                });
                if (res.ok) {
                    this.announce("Texto salvo e sincronizado na nuvem!");
                } else {
                    throw new Error("Erro na API do GitHub");
                }
            } catch (err) {
                this.announce("Salvo apenas no aparelho. Erro ao sincronizar.");
                console.error(err);
            }
        } else {
            this.announce("Salvo no aparelho.");
        }
        alert("Salvo!");
    },

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            document.getElementById('github-token').value = localStorage.getItem('codice_github_token') || '';
            document.getElementById('gist-id').value = localStorage.getItem('codice_gist_id') || '';
        } else {
            panel.style.display = 'none';
        }
    },

    saveSettings() {
        const token = document.getElementById('github-token').value;
        const gistId = document.getElementById('gist-id').value;
        localStorage.setItem('codice_github_token', token);
        localStorage.setItem('codice_gist_id', gistId);
        this.announce("Configurações salvas. Tentando sincronizar...");
        this.fetchDocs();
    },

    toggleEditor() {
        const panel = document.getElementById('editor-collapsible');
        const btn = document.getElementById('btn-toggle-editor');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.innerText = "➖ Esconder Área de Edição/Colagem";
            this.announce("Área de edição aberta.");
        } else {
            panel.style.display = 'none';
            btn.innerText = "➕ Mostrar Área de Edição/Colagem";
            this.announce("Área de edição escondida.");
        }
    },

    toggleFormatting() {
        const panel = document.getElementById('formatting-collapsible');
        const btn = document.getElementById('btn-toggle-formatting');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.innerText = "➖ Esconder Opções de Formatação";
            this.announce("Painel de formatação aberto.");
        } else {
            panel.style.display = 'none';
            btn.innerText = "🎨 Opções de Formatação Visual";
            this.announce("Painel de formatação fechado.");
        }
    },

    toggleExport() {
        const panel = document.getElementById('export-collapsible');
        const btn = document.getElementById('btn-toggle-export');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.innerText = "➖ Esconder Opções de Exportação";
            this.announce("Painel de exportação aberto.");
        } else {
            panel.style.display = 'none';
            btn.innerText = "📥 Finalizar e Exportar Documento";
            this.announce("Painel de exportação fechado.");
        }
    },

    applyFormatting() {
        const size = document.getElementById('font-size').value;
        const color = document.getElementById('font-color').value;
        const bgColor = document.getElementById('bg-editor-color').value;
        
        const editor = document.getElementById('active-editor');
        editor.style.fontSize = size;
        editor.style.color = color;
        editor.style.backgroundColor = bgColor;

        // Salva nos metadados do documento atual
        if (this.currentDoc) {
            this.currentDoc.metadata = this.currentDoc.metadata || {};
            this.currentDoc.metadata.format = { size, color, bgColor };
        }
    },

    showPreview() {
        const data = this.getFieldsData();
        const previewArea = document.getElementById('preview-area');
        const contentDiv = document.getElementById('hypertext-content');
        
        let html = "";
        Object.keys(data).forEach(key => {
            html += `<h4>${key.toUpperCase()}</h4>`;
            // Regex simples para converter URLs em links clicáveis
            const textWithLinks = data[key].replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
            html += `<p style="white-space: pre-wrap;">${textWithLinks}</p>`;
        });

        contentDiv.innerHTML = html;
        previewArea.style.display = 'block';
        this.announce("Visualização de hipertexto aberta.");
    },

    // EXPORTAÇÃO
    export(type) {
        const data = this.getFieldsData();
        const title = data.title || "documento";

        if (type === 'txt') {
            let text = "";
            Object.values(data).forEach(v => text += v + "\n\n");
            this.downloadFile(text, 'txt');
        } 
        else if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let y = 20;
            
            Object.keys(data).forEach(key => {
                doc.setFont("helvetica", "bold");
                doc.text(key.toUpperCase(), 10, y);
                y += 10;
                doc.setFont("helvetica", "normal");
                const split = doc.splitTextToSize(data[key], 180);
                doc.text(split, 10, y);
                y += (split.length * 7) + 10;
                if (y > 270) { doc.addPage(); y = 20; }
            });
            doc.save(`${title}.pdf`);
        }
        else if (type === 'docx') {
            this.generateDocx(data, title);
        }
    },

    downloadFile(content, extension) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `codice_${Date.now()}.${extension}`;
        a.click();
    },

    generateDocx(data, title) {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;

        const children = [];
        
        // Lógica ABNT2 básica se for o template
        if (this.currentDoc.template === 'abnt2') {
            // Capa simplificada
            children.push(new Paragraph({ text: data.inst?.toUpperCase(), alignment: AlignmentType.CENTER }));
            children.push(new Paragraph({ text: data.author, alignment: AlignmentType.CENTER, spacing: { before: 1000 } }));
            children.push(new Paragraph({ text: data.title?.toUpperCase(), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { before: 2000 } }));
            children.push(new Paragraph({ text: data.city + " - " + data.year, alignment: AlignmentType.CENTER, spacing: { before: 4000 } }));
        } else {
            Object.keys(data).forEach(key => {
                children.push(new Paragraph({ text: key.toUpperCase(), heading: HeadingLevel.HEADING_2 }));
                children.push(new Paragraph({ text: data[key], spacing: { after: 200 } }));
            });
        }

        const doc = new Document({
            sections: [{ properties: {}, children: children }]
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${title}.docx`;
            a.click();
        });
    }
};

app.init();
