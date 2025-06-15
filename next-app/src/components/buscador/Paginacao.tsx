export interface paginacaoProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number

}
export default function Paginacao(props: paginacaoProps){
  const {currentPage, totalPages, setCurrentPage} = props
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return(
    <div className="pagination flex justify-center gap-2 mt-4 w-3xl absolute bottom-0 left-1/2 -translate-x-1/2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {(() => {
              const pages = [];

              // Adiciona sempre a primeira página
              if (1 === currentPage) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border rounded-lg bg-primary text-white"
                  >
                    1
                  </button>
                );
              } else {
                pages.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    1
                  </button>
                );
              }

              // Adiciona "..." se necessário
              if (currentPage > 4) {
                pages.push(
                  <span key="start-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }

              // Páginas antes e depois da atual
              for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                if (i > 1 && i < totalPages) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === i
                          ? "bg-primary text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
              }

              // Adiciona "..." antes da última se necessário
              if (currentPage < totalPages - 3) {
                pages.push(
                  <span key="end-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }

              // Adiciona sempre a última página (se for mais que 1)
              if (totalPages > 1) {
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === totalPages
                        ? "bg-primary text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
         </div>
  )
}