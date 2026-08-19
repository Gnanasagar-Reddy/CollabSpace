function DashboardHeader({ onCreate }) {

    return (
        <header className="dashboard-header">

            <div className="brand">
                <div className="brand-logo">
                    C
                </div>

                <span>
                    CollabSpace
                </span>
            </div>


            <div className="dashboard-header-right">

                <button
                    className="new-document-btn"
                    onClick={onCreate}
                >
                    <span>+</span>
                    New Document
                </button>

            </div>

        </header>
    );

}

export default DashboardHeader;