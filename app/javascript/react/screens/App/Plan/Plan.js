import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb, Spinner } from 'patternfly-react';
import Toolbar from '../../../config/Toolbar';
import PlanRequestDetailList from './components/PlanRequestDetailList';

class Plan extends React.Component {
  // constructor(props) {
  //   super(props);

  // bindMethods(this, ['stopPolling', 'startPolling']);
  // }

  componentDidMount() {
    const { fetchPlanRequestsUrl, fetchPlanRequestsAction } = this.props;

    fetchPlanRequestsAction(fetchPlanRequestsUrl);

    // this.startPolling();
  }

  // componentWillUnmount() {
  //   this.stopPolling();
  // }

  // startPolling() {
  //   const {
  //     fetchPlanRequestsAction,
  //     fetchPlanRequestsUrl
  //   } = this.props;
  //   this.pollingInterval = setInterval(() => {
  //     fetchPlanRequestsAction(fetchPlanRequestsUrl);
  //   }, 15000);
  // }

  // stopPolling() {
  //   if (this.pollingInterval) {
  //     clearInterval(this.pollingInterval);
  //     this.pollingInterval = null;
  //   }
  // }

  render() {
    const {
      planRequestDetails,
      isRejectedPlanRequests,
      isFetchingPlanRequests
    } = this.props;

    return (
      <React.Fragment>
        <Toolbar>
          <Breadcrumb.Item href="/dashboard/maintab?tab=compute">
            Compute
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/migration">Migration</Link>
          </Breadcrumb.Item>
          {!isFetchingPlanRequests &&
            !isRejectedPlanRequests &&
            planRequestDetails.name && (
              <Breadcrumb.Item active>
                {planRequestDetails.name}
              </Breadcrumb.Item>
            )}
        </Toolbar>
        <div style={{ overflow: 'auto', paddingBottom: 1, height: '100%' }}>
          <Spinner loading={isFetchingPlanRequests}>
            {!isFetchingPlanRequests &&
              !isRejectedPlanRequests &&
              planRequestDetails.tasks &&
              planRequestDetails.tasks.length > 0 && (
                <PlanRequestDetailList
                  planRequestDetails={planRequestDetails}
                />
              )}
          </Spinner>
        </div>
      </React.Fragment>
    );
  }
}
Plan.propTypes = {
  fetchPlanRequestsUrl: PropTypes.string.isRequired,
  fetchPlanRequestsAction: PropTypes.func.isRequired,
  planRequestDetails: PropTypes.object,
  isRejectedPlanRequests: PropTypes.bool,
  isFetchingPlanRequests: PropTypes.bool,
  errorPlanRequests: PropTypes.object // eslint-disable-line react/no-unused-prop-types
};
Plan.defaultProps = {
  planRequestDetails: {},
  isRejectedPlanRequests: false,
  isFetchingPlanRequests: false,
  errorPlanRequests: null
};
export default Plan;