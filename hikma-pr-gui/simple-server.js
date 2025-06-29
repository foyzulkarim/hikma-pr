const http = require('http');
const url = require('url');
const { PrismaClient } = require('@prisma/client');

// Setup database configuration
const os = require('os');
const fs = require('fs');
const path = require('path');

function setupDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    const homeDir = os.homedir();
    const hikmaDir = path.join(homeDir, '.hikmapr');
    const dbPath = path.join(hikmaDir, 'reviews.db');
    
    if (!fs.existsSync(hikmaDir)) {
      fs.mkdirSync(hikmaDir, { recursive: true });
    }
    
    process.env.DATABASE_URL = `file:${dbPath}`;
  }
}

setupDatabaseConfig();

const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (pathname === '/api/reviews' && req.method === 'GET') {
      const reviews = await prisma.review.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          fileAnalyses: true,
          chunkAnalyses: {
            include: {
              analysisPasses: true,
              pluginFindings: true
            }
          },
          pluginFindings: true
        }
      });
      
      const reviewsWithCounts = reviews.map(review => ({
        ...review,
        _count: {
          chunkAnalyses: review.chunkAnalyses?.length || 0,
          analysisPasses: review.analysisPasses?.length || 0,
          pluginFindings: review.pluginFindings?.length || 0
        }
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reviewsWithCounts));
      return;
    }

    if (pathname.startsWith('/api/reviews/') && req.method === 'GET') {
      const id = pathname.split('/')[3];
      const review = await prisma.review.findUnique({
        where: { id: id },
        include: {
          fileAnalyses: true,
          chunkAnalyses: {
            include: {
              analysisPasses: {
                orderBy: { passType: 'asc' }
              },
              pluginFindings: {
                orderBy: { severity: 'desc' }
              }
            },
            orderBy: { filePath: 'asc' }
          },
          pluginFindings: {
            orderBy: { severity: 'desc' }
          }
        }
      });

      if (!review) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Review not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(review));
      return;
    }

    // Serve HTML for all other routes
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hikma PR Reviews</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function App() {
            const [reviews, setReviews] = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const [selectedReview, setSelectedReview] = React.useState(null);

            React.useEffect(() => {
                fetch('/api/reviews')
                    .then(res => res.json())
                    .then(data => {
                        setReviews(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error(err);
                        setLoading(false);
                    });
            }, []);

            const viewReview = (reviewId) => {
                fetch('/api/reviews/' + reviewId)
                    .then(res => res.json())
                    .then(data => setSelectedReview(data))
                    .catch(err => console.error(err));
            };

            if (loading) {
                return React.createElement('div', { className: 'p-8 text-center' }, 
                    React.createElement('div', { className: 'text-xl' }, 'Loading Hikma PR Reviews...')
                );
            }

            if (selectedReview) {
                return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-8' },
                    React.createElement('div', { className: 'max-w-6xl mx-auto' },
                        React.createElement('button', { 
                            className: 'mb-4 text-blue-600 hover:text-blue-800',
                            onClick: () => setSelectedReview(null)
                        }, '← Back to Reviews'),
                        React.createElement('h1', { className: 'text-3xl font-bold mb-4' }, 
                            selectedReview.state.pr_details?.title || 'Untitled PR'
                        ),
                        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow mb-6' },
                            React.createElement('h2', { className: 'text-xl font-semibold mb-4' }, 'Review Details'),
                            React.createElement('p', { className: 'text-gray-600 mb-2' }, 
                                'Created: ' + new Date(selectedReview.createdAt).toLocaleString()
                            ),
                            React.createElement('p', { className: 'text-gray-600 mb-2' }, 
                                'PR URL: ' + selectedReview.prUrl
                            ),
                            selectedReview.state.final_report && React.createElement('div', { className: 'mt-4' },
                                React.createElement('h3', { className: 'font-semibold mb-2' }, 'Final Report'),
                                React.createElement('pre', { className: 'bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap' }, 
                                    selectedReview.state.final_report
                                )
                            )
                        )
                    )
                );
            }

            return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-8' },
                React.createElement('div', { className: 'max-w-6xl mx-auto' },
                    React.createElement('div', { className: 'mb-8' },
                        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 mb-2' }, 
                            '🔬 Hikma PR Reviews'
                        ),
                        React.createElement('p', { className: 'text-gray-600' }, 
                            'Advanced AI-powered pull request analysis'
                        )
                    ),
                    reviews.length === 0 
                        ? React.createElement('div', { className: 'bg-white rounded-lg shadow p-8 text-center' },
                            React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 
                                'No Reviews Yet'
                            ),
                            React.createElement('p', { className: 'text-gray-600 mb-4' }, 
                                'Start your first PR analysis with the CLI:'
                            ),
                            React.createElement('code', { className: 'bg-gray-100 px-3 py-2 rounded text-sm' }, 
                                'hikma review https://github.com/owner/repo/pull/123'
                            )
                        )
                        : React.createElement('div', { className: 'space-y-6' },
                            reviews.map(review => 
                                React.createElement('div', { 
                                    key: review.id, 
                                    className: 'bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer border border-gray-200 hover:border-blue-300',
                                    onClick: () => viewReview(review.id)
                                },
                                    React.createElement('div', { className: 'flex items-start justify-between mb-4' },
                                        React.createElement('div', { className: 'flex-1' },
                                            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, 
                                                review.state.pr_details?.title || 'Untitled PR'
                                            ),
                                            React.createElement('div', { className: 'flex items-center gap-4 text-sm text-gray-500' },
                                                React.createElement('span', null, 
                                                    '📅 ' + new Date(review.createdAt).toLocaleString()
                                                ),
                                                review._count && React.createElement('span', null, 
                                                    '🧩 ' + review._count.chunkAnalyses + ' chunks'
                                                ),
                                                review._count && React.createElement('span', null, 
                                                    '🔬 ' + review._count.analysisPasses + ' passes'
                                                )
                                            )
                                        ),
                                        React.createElement('div', { className: 'text-right' },
                                            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Click to view')
                                        )
                                    ),
                                    review.error && React.createElement('div', { className: 'mt-3 p-3 bg-red-50 border border-red-200 rounded' },
                                        React.createElement('p', { className: 'text-sm text-red-600' }, 
                                            '❌ ' + review.error
                                        )
                                    )
                                )
                            )
                        )
                )
            );
        }

        ReactDOM.render(React.createElement(App), document.getElementById('root'));
    </script>
</body>
</html>`);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
  }
});

server.listen(port, () => {
  console.log('🚀 Hikma PR GUI running at http://localhost:' + port);
});
