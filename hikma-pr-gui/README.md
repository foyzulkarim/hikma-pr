# 🔬 Hikmapr GUI - Multi-Pass PR Analysis Dashboard

A modern Next.js dashboard for viewing and analyzing Hikmapr's advanced multi-pass PR reviews.

## ✨ Features

### **Multi-Pass Analysis Visualization**
- **4 Specialized Analysis Passes**: View Syntax/Logic, Security/Performance, Architecture/Design, and Testing/Documentation analyses
- **Risk Level Indicators**: Visual badges showing LOW, MEDIUM, HIGH, and CRITICAL risk levels
- **Progress Tracking**: Real-time progress bars showing completion across files, chunks, and analysis passes

### **Hierarchical Analysis Display**
- **File-Level Grouping**: Chunk analyses organized by file path
- **Chunk Details**: View individual diff chunks with context and token counts
- **Pass Filtering**: Filter analyses by specific pass types
- **Expandable Content**: Drill down into detailed analysis results and diff content

### **Decision Support**
- **Synthesis Summary**: Critical issues, recommendations, and suggestions categorized by importance
- **Final Decision**: APPROVE/REQUEST_CHANGES/REJECT recommendations with reasoning
- **Legacy Support**: Backwards compatibility with V1 file analyses

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- NPM or Yarn
- Hikmapr CLI running analyses (creates the database)

### Installation
```bash
cd hikma-pr-gui
npm install
```

### Database Setup
The GUI shares the same SQLite database as the CLI (`~/.hikmapr/reviews.db`). Make sure you've run at least one analysis with the CLI first:

```bash
# Run from the main hikma-pr directory
hikma review https://github.com/owner/repo/pull/123
```

**⚠️ Important:** If you encounter database errors after schema changes in the main app, see [DATABASE.md](./DATABASE.md) for detailed sync instructions.

### Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build
```bash
npm run build
npm start
```

## 📊 Dashboard Overview

### **Main Dashboard**
- **Review List**: All PR analyses with progress indicators and risk levels
- **Quick Stats**: Files analyzed, chunks processed, analysis passes completed
- **Status Indicators**: Visual progress bars and completion percentages
- **Decision Badges**: Color-coded APPROVE/REQUEST_CHANGES/REJECT indicators

### **Review Detail Page**
- **Header Section**: PR details, progress metrics, and final decision
- **Final Report**: Complete LLM-generated analysis summary
- **Analysis Summary**: Categorized issues and recommendations
- **Pass Filtering**: Filter by analysis pass type (Syntax, Security, Architecture, Testing)
- **File Organization**: Chunks grouped by file with expandable details
- **Diff Viewer**: Syntax-highlighted diff content for each chunk

## 🔧 Technical Architecture

### **Database Schema**
- **Review**: Main PR review record with state JSON
- **ChunkAnalysis**: Individual diff chunks with metadata
- **AnalysisPass**: 4-pass analysis results per chunk
- **FileAnalysis**: Legacy file-level analyses (V1 compatibility)

### **API Endpoints**
- `GET /api/reviews` - List all reviews with analysis counts
- `GET /api/reviews/[id]` - Detailed review with all analysis data

### **Key Components**
- **Risk Badges**: Color-coded risk level indicators
- **Progress Bars**: Real-time analysis progress tracking  
- **Pass Type Icons**: Visual indicators for analysis pass types
- **File Icons**: File type recognition and display
- **Expandable Sections**: Drill-down analysis exploration

## 🎨 UI/UX Features

### **Visual Indicators**
- 🔍 Syntax & Logic Analysis
- 🔒 Security & Performance Analysis  
- 🏗️ Architecture & Design Analysis
- 📋 Testing & Documentation Analysis

### **Risk Level Color Coding**
- 🟢 **LOW**: Green - Minor or no issues
- 🟡 **MEDIUM**: Yellow - Moderate attention needed
- 🟠 **HIGH**: Orange - Important issues requiring fixes
- 🔴 **CRITICAL**: Red - Serious issues blocking merge

### **Responsive Design**
- Mobile-friendly layout
- Adaptive grid systems
- Collapsible sections for mobile viewing
- Touch-friendly interaction elements

## 🔄 Data Flow

1. **CLI Analysis**: User runs `hikma review <PR_URL>` 
2. **Database Storage**: Multi-pass analysis results saved to SQLite
3. **API Layer**: Next.js API routes serve analysis data
4. **React Components**: Dynamic rendering of analysis results
5. **Real-time Updates**: Progress tracking during ongoing analyses

## 🛠️ Development

### **Project Structure**
```
src/
├── app/
│   ├── api/reviews/          # API endpoints
│   ├── review/[id]/          # Review detail page
│   └── page.tsx              # Main dashboard
├── lib/
│   └── prisma.ts             # Database client
└── prisma/
    ├── schema.prisma         # Database schema
    └── migrations/           # Database migrations
```

### **Key Dependencies**
- **Next.js 15**: React framework with App Router
- **Prisma**: Database ORM and migrations
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety and development experience

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live progress
- **Analysis Comparison**: Compare analyses across PR versions
- **Export Features**: PDF/Markdown report generation
- **Team Analytics**: Aggregate analysis metrics and trends
- **Custom Filtering**: Advanced search and filter capabilities
- **Integration APIs**: Webhook support for CI/CD pipelines

## 📝 Usage Examples

### **Viewing Analysis Progress**
The dashboard shows real-time progress as analyses run:
- Files: 3/5 completed
- Chunks: 12/20 processed  
- Passes: 45/80 analysis passes completed
- Overall: 85% complete

### **Filtering Analysis Results**
Use the pass type filter to focus on specific aspects:
- **All**: View all analysis passes together
- **Syntax & Logic**: Focus on code quality issues
- **Security**: Review security vulnerabilities
- **Architecture**: Examine design patterns
- **Testing**: Check test coverage and documentation

### **Risk Assessment**
Each chunk shows risk levels per analysis pass:
- Multiple LOW risk passes → File likely safe to merge
- Any HIGH/CRITICAL passes → Requires attention before merge
- Mixed risk levels → Selective review needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
