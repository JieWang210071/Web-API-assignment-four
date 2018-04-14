import React, { Component }  from 'react';
import {connect} from "react-redux";
import { Glyphicon, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Image } from 'react-bootstrap'
import { withRouter } from "react-router-dom";
import {fetchMovie, submitReview} from "../actions/movieActions";
import { Col, Form, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';

//support routing by creating a new component

class Movie extends Component {

    constructor(props) {
        super(props);
        this.updateDetails = this.updateDetails.bind(this);
        this.handleSubmitReview = this.handleSubmitReview.bind(this);

        this.state = {
            details:{
                quote: '',
                rating: '',
                title: this.props.movieId,
                name: localStorage.getItem('username')
            }
        };
    }

    componentDidMount() {
        const {dispatch} = this.props;
        if (this.props.selectedMovie == null)
            dispatch(fetchMovie(this.props.title));
    }

    updateDetails(event){
        let updateDetails = Object.assign({}, this.state.details);

        updateDetails[event.target.id] = event.target.value;
        this.setState({
            details: updateDetails
        });
    }

    handleSubmitReview() {
        const {dispatch} = this.props;
        dispatch(submitReview(this.state.details));
    }

    render() {
        const ActorInfo = ({actors}) => {
            return actors.map((actor, i) =>
                <p key={i}>
                    <b>{actor.actor}</b> {actor.character}
                </p>
            );
        };

        const ReviewInfo = ({reviews}) => {
            return reviews.map((review, i) =>
                <p key={i}>
                <b>{review.name}</b> {review.quote}
                    <Glyphicon glyph={'star'} /> {review.rating}
                </p>
            );
        }

        const DetailInfo = ({currentMovie}) => {
            if (!currentMovie) { // evaluates to true if currentMovie is null
                return <div>Loading...</div>;
            }
            return (
                <Panel>
                    <Panel.Heading>Movie Detail</Panel.Heading>
                    <Panel.Body><Image className="image" src={currentMovie.imageUrl} thumbnail /></Panel.Body>
                    <ListGroup>
                        <ListGroupItem>{currentMovie.title}</ListGroupItem>
                        <ListGroupItem><ActorInfo actors={currentMovie.actors} /></ListGroupItem>
                        <ListGroupItem><h4><Glyphicon glyph={'star'} /> {currentMovie.avgRating} </h4></ListGroupItem>
                    </ListGroup>
                    <Panel.Body><ReviewInfo reviews={currentMovie.review} /></Panel.Body>
                </Panel>
            );
        };
        return (
            <div>
                <DetailInfo currentMovie={this.props.selectedMovie} />
                <Form horizontal>
                <FormGroup controlId="rating">
                    <Col componentClass={ControlLabel} sm={2}>
                        Rating
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails} value={this.state.details.rating} type="input" placeholder="Rate" />
                    </Col>
                </FormGroup>

                <FormGroup controlId="quote">
                    <Col componentClass={ControlLabel} sm={2}>
                        Comment
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails} value={this.state.details.quote} componentClass="textarea" placeholder="comment" />
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col smOffset={2} sm={10}>
                        <Button onClick={this.handleSubmitReview}>Submit Rating</Button>
                    </Col>
                </FormGroup>
            </Form>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    console.log(ownProps);
    return {
        selectedMovie: state.movie.selectedMovie,
        movieId: ownProps.match.params.movieId
    }
}

export default withRouter(connect(mapStateToProps)(Movie));